#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const OPENAPI_URL = 'https://api.artifactsmmo.com/openapi.json';
const API_REFERENCE_DIR = path.resolve('src/content/docs/api_guide/api_reference');
const API_REFERENCE_INDEX = path.join(API_REFERENCE_DIR, 'index.mdx');
const PAGINATION_FILE = path.resolve('src/content/docs/api_guide/pagination.mdx');
const LEGACY_SINGLE_PAGE = path.resolve('src/content/docs/api_guide/api_reference.mdx');
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

const TAG_ORDER = [
  'Server details',
  'Token',
  'Accounts',
  'Characters',
  'My account',
  'My characters',
  'Items',
  'Monsters',
  'Maps',
  'Resources',
  'NPCs',
  'Events',
  'Achievements',
  'Badges',
  'Effects',
  'Tasks',
  'Grand Exchange',
  'Leaderboard',
  'Simulation',
];

const TAG_SLUGS = {
  'Server details': 'server-details',
  Token: 'token',
  Accounts: 'accounts',
  Characters: 'characters',
  'My account': 'my-account',
  'My characters': 'my-characters',
  Items: 'items',
  Monsters: 'monsters',
  Maps: 'maps',
  Resources: 'resources',
  NPCs: 'npcs',
  Events: 'events',
  Achievements: 'achievements',
  Badges: 'badges',
  Effects: 'effects',
  Tasks: 'tasks',
  'Grand Exchange': 'grand-exchange',
  Leaderboard: 'leaderboard',
  Simulation: 'simulation',
};

const PATH_SAMPLE_VALUES = {
  account: 'YOUR_ACCOUNT',
  name: 'YOUR_CHARACTER_NAME',
  code: 'copper_ore',
  id: '123',
  map_id: '101',
  layer: 'overworld',
  x: '0',
  y: '1',
};

function stripBom(value) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

function refName(ref) {
  return ref.split('/').pop();
}

function mergeSchemas(a = {}, b = {}) {
  const out = { ...a, ...b };
  if (a.properties || b.properties) {
    out.properties = { ...(a.properties || {}), ...(b.properties || {}) };
  }
  const req = new Set([...(a.required || []), ...(b.required || [])]);
  if (req.size > 0) {
    out.required = [...req];
  }
  return out;
}

function expandSchema(raw, spec, seen = new Set()) {
  if (!raw) return null;
  if (raw.$ref) {
    if (seen.has(raw.$ref)) return {};
    seen.add(raw.$ref);
    const resolved = expandSchema(spec.components.schemas[refName(raw.$ref)], spec, seen);
    seen.delete(raw.$ref);
    const next = { ...raw };
    delete next.$ref;
    return mergeSchemas(resolved, next);
  }
  if (raw.allOf) {
    let merged = {};
    for (const item of raw.allOf) merged = mergeSchemas(merged, expandSchema(item, spec, seen));
    const next = { ...raw };
    delete next.allOf;
    return mergeSchemas(merged, next);
  }
  const out = { ...raw };
  if (out.oneOf) out.oneOf = out.oneOf.map((item) => expandSchema(item, spec, seen));
  if (out.anyOf) out.anyOf = out.anyOf.map((item) => expandSchema(item, spec, seen));
  if (out.type === 'array' && out.items) out.items = expandSchema(out.items, spec, seen);
  if (out.properties) {
    const props = {};
    for (const [key, value] of Object.entries(out.properties)) props[key] = expandSchema(value, spec, seen);
    out.properties = props;
  }
  return out;
}

function typeLabel(schema) {
  if (!schema) return 'unknown';
  if (schema.enum?.length) {
    const values = schema.enum.slice(0, 4).join(', ');
    return `enum(${values}${schema.enum.length > 4 ? ', ...' : ''})`;
  }
  if (schema.oneOf?.length) return schema.oneOf.map(typeLabel).join(' | ');
  if (schema.anyOf?.length) return schema.anyOf.map(typeLabel).join(' | ');
  if (schema.type === 'array') return `array<${typeLabel(schema.items)}>`;
  if (schema.type === 'object') return schema.title || 'object';
  if (schema.format) return `${schema.type} (${schema.format})`;
  return schema.type || schema.title || 'unknown';
}

function sampleString(name) {
  const n = name.toLowerCase();
  if (n.includes('username')) return 'YOUR_USERNAME';
  if (n.includes('password')) return 'YOUR_PASSWORD';
  if (n.includes('email')) return 'you@example.com';
  if (n.includes('account')) return 'YOUR_ACCOUNT';
  if (n.includes('character') || n === 'name') return 'YOUR_CHARACTER_NAME';
  if (n.includes('code')) return 'copper_ore';
  if (n.includes('sort')) return 'combat';
  if (n.includes('layer')) return 'overworld';
  if (n.includes('skin')) return 'men1';
  return 'string';
}

function sampleValue(rawSchema, name, spec) {
  const schema = expandSchema(rawSchema, spec);
  if (!schema) return null;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum?.length) return schema.enum[0];
  if (schema.oneOf?.length) return sampleValue(schema.oneOf[0], name, spec);
  if (schema.anyOf?.length) return sampleValue(schema.anyOf[0], name, spec);
  if (schema.type === 'array') return [sampleValue(schema.items, name, spec)];
  if (schema.type === 'object' || schema.properties) {
    const props = schema.properties || {};
    const names = schema.required?.length ? schema.required : Object.keys(props).slice(0, 2);
    const out = {};
    for (const key of names.slice(0, 4)) out[key] = sampleValue(props[key], key, spec);
    return out;
  }
  const n = name.toLowerCase();
  if (schema.type === 'integer' || schema.type === 'number') {
    if (n.includes('page')) return 1;
    if (n.includes('size')) return 50;
    if (n.includes('x')) return 0;
    if (n.includes('y')) return 1;
    if (n.includes('quantity')) return 1;
    if (n.includes('price')) return 10;
    if (n.includes('id')) return 123;
    return 1;
  }
  if (schema.type === 'boolean') return true;
  return sampleString(name);
}

function normalizeParameters(pathItem, operation) {
  const list = [...(pathItem.parameters || []), ...(operation.parameters || [])];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = `${item.in}:${item.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function requestBodySchema(operation) {
  const body = operation.requestBody;
  if (!body?.content) return null;
  if (body.content['application/json']) return body.content['application/json'].schema;
  const first = Object.values(body.content)[0];
  return first?.schema || null;
}

function authMode(operation) {
  if (!Array.isArray(operation.security) || operation.security.length === 0) return 'public';
  const names = new Set();
  for (const sec of operation.security) {
    for (const name of Object.keys(sec)) names.add(name);
  }
  if (names.has('JWTBearer')) return 'bearer';
  if (names.has('HTTPBasic')) return 'basic';
  return 'auth';
}

function bodyRows(rawSchema, requiredFlag, spec) {
  const schema = expandSchema(rawSchema, spec);
  if (!schema) return [];
  if (schema.type === 'array') {
    const rows = [
      {
        parameter: 'body',
        in: 'body',
        type: typeLabel(schema),
        required: requiredFlag,
        description: schema.description || 'Request body payload.',
      },
    ];
    const item = expandSchema(schema.items, spec);
    if (item?.properties) {
      const req = new Set(item.required || []);
      for (const [name, field] of Object.entries(item.properties)) {
        rows.push({
          parameter: `body[].${name}`,
          in: 'body',
          type: typeLabel(field),
          required: req.has(name) ? 'Yes' : 'No',
          description: field.description || '',
        });
      }
    }
    return rows;
  }
  if (schema.properties) {
    const req = new Set(schema.required || []);
    return Object.entries(schema.properties).map(([name, field]) => ({
      parameter: `body.${name}`,
      in: 'body',
      type: typeLabel(field),
      required: req.has(name) ? 'Yes' : 'No',
      description: field.description || '',
    }));
  }
  return [
    {
      parameter: 'body',
      in: 'body',
      type: typeLabel(schema),
      required: requiredFlag,
      description: schema.description || 'Request body payload.',
    },
  ];
}

function toPathSample(pathTemplate) {
  return pathTemplate.replace(/\{([^}]+)\}/g, (_, name) => PATH_SAMPLE_VALUES[name] || `YOUR_${name.toUpperCase()}`);
}

function pickQuerySamples(queryParams) {
  if (queryParams.length === 0) return [];
  const required = queryParams.filter((p) => p.required);
  const optional = queryParams.filter((p) => !p.required);
  const firstOptional = optional.find((p) => !['page', 'size'].includes(p.name));
  const page = optional.find((p) => p.name === 'page');
  const size = optional.find((p) => p.name === 'size');
  const out = [...required];
  if (firstOptional) out.push(firstOptional);
  if (page) out.push(page);
  if (size) out.push(size);
  return out.slice(0, 4);
}

function asQueryValue(value) {
  if (Array.isArray(value)) return asQueryValue(value[0]);
  if (value === undefined || value === null) return '';
  return String(value);
}

function buildUrl(operation, pathItem, spec) {
  const base = 'https://api.artifactsmmo.com';
  const endpoint = toPathSample(operation.path);
  const queryParams = normalizeParameters(pathItem, operation).filter((p) => p.in === 'query');
  const samples = pickQuerySamples(queryParams);
  if (samples.length === 0) return `${base}${endpoint}`;
  const qs = new URLSearchParams();
  for (const param of samples) qs.set(param.name, asQueryValue(sampleValue(param.schema, param.name, spec)));
  return `${base}${endpoint}?${qs.toString()}`;
}

function escapeCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function jsLiteral(value, level = 0) {
  const indent = ' '.repeat(level * 2);
  const next = ' '.repeat((level + 1) * 2);
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[\n${value.map((item) => `${next}${jsLiteral(item, level + 1)}`).join(',\n')}\n${indent}]`;
  }
  const entries = Object.entries(value || {});
  if (entries.length === 0) return '{}';
  return `{\n${entries.map(([k, v]) => `${next}${k}: ${jsLiteral(v, level + 1)}`).join(',\n')}\n${indent}}`;
}

function pyLiteral(value, level = 0) {
  const indent = ' '.repeat(level * 4);
  const next = ' '.repeat((level + 1) * 4);
  if (value === null) return 'None';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[\n${value.map((item) => `${next}${pyLiteral(item, level + 1)}`).join(',\n')}\n${indent}]`;
  }
  const entries = Object.entries(value || {});
  if (entries.length === 0) return '{}';
  return `{\n${entries.map(([k, v]) => `${next}${JSON.stringify(k)}: ${pyLiteral(v, level + 1)}`).join(',\n')}\n${indent}}`;
}

function curlSnippet(method, url, auth, body) {
  const hasAuthLine = auth !== 'public';
  const lines = [`curl --request ${method.toUpperCase()} \\`, `  --url '${url}' \\`, `  --header 'Accept: application/json'${hasAuthLine || body ? ' \\' : ''}`];
  if (auth === 'bearer') lines.push(`  --header 'Authorization: Bearer YOUR_TOKEN'${body ? ' \\' : ''}`);
  if (auth === 'basic') lines.push(`  --user 'YOUR_USERNAME:YOUR_PASSWORD'${body ? ' \\' : ''}`);
  if (body) {
    lines.push("  --header 'Content-Type: application/json' \\");
    const payload = JSON.stringify(body, null, 2).split('\n').map((line) => `  ${line}`).join('\n');
    lines.push(`  --data '${payload}\n  '`);
  }
  return lines.join('\n');
}

function jsSnippet(method, url, auth, body) {
  const headers = [`    Accept: 'application/json'`];
  if (auth === 'bearer') headers.push(`    Authorization: 'Bearer YOUR_TOKEN'`);
  if (auth === 'basic') headers.push(`    Authorization: 'Basic ' + btoa('YOUR_USERNAME:YOUR_PASSWORD')`);
  if (body) headers.push(`    'Content-Type': 'application/json'`);
  const lines = [`const url = '${url}';`, 'const options = {', `  method: '${method.toUpperCase()}',`, '  headers: {', headers.join(',\n'), `  }${body ? ',' : ''}`];
  if (body) lines.push(`  body: JSON.stringify(${jsLiteral(body, 1)})`);
  lines.push('};', '', 'const response = await fetch(url, options);', 'const data = await response.json();', 'console.log(data);');
  return lines.join('\n');
}

function pySnippet(method, url, auth, body) {
  const headers = ['"Accept": "application/json"'];
  if (auth === 'bearer') headers.push('"Authorization": "Bearer YOUR_TOKEN"');
  if (body) headers.push('"Content-Type": "application/json"');
  const lines = ['import requests', '', `url = "${url}"`, 'headers = {', ...headers.map((h) => `    ${h},`), '}', ''];
  const authArg = auth === 'basic' ? ', auth=("YOUR_USERNAME", "YOUR_PASSWORD")' : '';
  if (body) {
    lines.push(`payload = ${pyLiteral(body)}`, '', `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload${authArg})`);
  } else {
    lines.push(`response = requests.${method.toLowerCase()}(url, headers=headers${authArg})`);
  }
  lines.push('print(response.json())');
  return lines.join('\n');
}

function sdkSnippetFor(operation) {
  const method = operation.method.toUpperCase();
  const path = operation.path;
  const prelude = ['from artifacts import ArtifactsClient'];
  const mode = authMode(operation);
  const start = mode === 'bearer' ? 'with ArtifactsClient(token="YOUR_TOKEN") as client:' : 'with ArtifactsClient() as client:';

  const authUnsupported = [
    ...prelude,
    '',
    '# No dedicated helper exists for this endpoint in the current SDK.',
    '# Use the Python requests example above.',
  ];

  if (method === 'POST' && path === '/token') return [...prelude, '', start, '    token = client.token.generate("YOUR_USERNAME", "YOUR_PASSWORD")', '    print(token)'].join('\n');
  if (method === 'GET' && path === '/') return [...prelude, '', start, '    result = client.server.get_status()', '    print(result)'].join('\n');

  if (path.startsWith('/my/{name}/action/')) {
    const action = path.replace('/my/{name}/action/', '');
    const imports = [...prelude];
    const lines = ['char = client.character("YOUR_CHARACTER_NAME")'];

    if (action === 'move') lines.push('result = char.move(x=0, y=1)');
    else if (action === 'transition') lines.push('result = char.transition()');
    else if (action === 'fight') lines.push('result = char.fight(participants=["ALLY_NAME"])');
    else if (action === 'rest') lines.push('result = char.rest()');
    else if (action === 'gathering') lines.push('result = char.skills.gather()');
    else if (action === 'crafting') lines.push('result = char.skills.craft(code="iron_sword", quantity=1)');
    else if (action === 'recycling') lines.push('result = char.skills.recycle(code="iron_sword", quantity=1)');
    else if (action === 'use') lines.push('result = char.inventory.use(code="small_health_potion", quantity=1)');
    else if (action === 'delete') lines.push('result = char.inventory.delete(code="junk_item", quantity=1)');
    else if (action === 'equip') {
      imports.push('from artifacts.models import ItemSlot');
      lines.push('result = char.equipment.equip(code="iron_sword", slot=ItemSlot.WEAPON)');
    } else if (action === 'unequip') {
      imports.push('from artifacts.models import ItemSlot');
      lines.push('result = char.equipment.unequip(slot=ItemSlot.WEAPON)');
    } else if (action === 'bank/deposit/gold') lines.push('result = char.bank.deposit_gold(quantity=100)');
    else if (action === 'bank/withdraw/gold') lines.push('result = char.bank.withdraw_gold(quantity=100)');
    else if (action === 'bank/deposit/item') {
      imports.push('from artifacts.models import SimpleItemSchema');
      lines.push('items = [SimpleItemSchema(code="copper_ore", quantity=10)]', 'result = char.bank.deposit_items(items)');
    } else if (action === 'bank/withdraw/item') {
      imports.push('from artifacts.models import SimpleItemSchema');
      lines.push('items = [SimpleItemSchema(code="copper_ore", quantity=10)]', 'result = char.bank.withdraw_items(items)');
    } else if (action === 'bank/buy_expansion') lines.push('result = char.bank.buy_expansion()');
    else if (action === 'npc/buy') lines.push('result = char.trading.npc_buy(code="wooden_staff", quantity=1)');
    else if (action === 'npc/sell') lines.push('result = char.trading.npc_sell(code="wooden_staff", quantity=1)');
    else if (action === 'give/gold') lines.push('result = char.trading.give_gold(quantity=100, character="ALLY_NAME")');
    else if (action === 'give/item') {
      imports.push('from artifacts.models import SimpleItemSchema');
      lines.push('items = [SimpleItemSchema(code="copper_ore", quantity=10)]', 'result = char.trading.give_items(items=items, character="ALLY_NAME")');
    } else if (action === 'claim_item/{id}') lines.push('result = char.claim_item(id=123)');
    else if (action === 'change_skin') {
      imports.push('from artifacts.models import CharacterSkin');
      lines.push('result = char.change_skin(skin=CharacterSkin.MEN2)');
    } else if (action === 'task/new') lines.push('result = char.tasks.new()');
    else if (action === 'task/complete') lines.push('result = char.tasks.complete()');
    else if (action === 'task/cancel') lines.push('result = char.tasks.cancel()');
    else if (action === 'task/exchange') lines.push('result = char.tasks.exchange()');
    else if (action === 'task/trade') lines.push('result = char.tasks.trade(code="copper_ore", quantity=10)');
    else if (action === 'grandexchange/buy') lines.push('result = char.ge.buy(id="ORDER_ID", quantity=1)');
    else if (action === 'grandexchange/create-sell-order') lines.push('result = char.ge.sell(code="copper_ore", quantity=10, price=5)');
    else if (action === 'grandexchange/cancel') lines.push('result = char.ge.cancel(id="ORDER_ID")');
    else if (action === 'grandexchange/create-buy-order') lines.push('result = char.ge.create_buy_order(code="copper_ore", quantity=10, price=5)');
    else if (action === 'grandexchange/fill') lines.push('result = char.ge.fill(id="ORDER_ID", quantity=5)');
    else return authUnsupported.join('\n');

    lines.push('print(result)');
    return [...imports, '', start, ...lines.map((line) => `    ${line}`)].join('\n');
  }

  if (path === '/my/characters') return [...prelude, '', start, '    result = client.my_account.get_characters()', '    print(result)'].join('\n');
  if (path === '/my/logs') return [...prelude, '', start, '    result = client.my_account.get_all_logs(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/my/logs/{name}') return [...prelude, '', start, '    char = client.character("YOUR_CHARACTER_NAME")', '    logs = char.get_logs(page=1, size=50)', '    print(logs)'].join('\n');
  if (path === '/my/details') return [...prelude, '', start, '    result = client.my_account.get_details()', '    print(result)'].join('\n');
  if (path === '/my/bank') return [...prelude, '', start, '    result = client.my_account.get_bank()', '    print(result)'].join('\n');
  if (path === '/my/bank/items') return [...prelude, '', start, '    result = client.my_account.get_bank_items(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/my/grandexchange/orders') return [...prelude, '', start, '    result = client.my_account.get_ge_orders(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/my/grandexchange/history') return [...prelude, '', start, '    result = client.my_account.get_ge_history(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/my/pending-items') return [...prelude, '', start, '    result = client.my_account.get_pending_items()', '    print(result)'].join('\n');
  if (path === '/my/change_password') return [...prelude, '', start, '    result = client.my_account.change_password(password="OLD_PASSWORD", new_password="NEW_PASSWORD")', '    print(result)'].join('\n');

  if (path === '/accounts/{account}') return [...prelude, '', start, '    result = client.accounts.get("YOUR_ACCOUNT")', '    print(result)'].join('\n');
  if (path === '/accounts/{account}/achievements') return [...prelude, '', start, '    result = client.accounts.get_achievements("YOUR_ACCOUNT")', '    print(result)'].join('\n');
  if (path === '/accounts/{account}/characters') return [...prelude, '', start, '    result = client.accounts.get_characters("YOUR_ACCOUNT")', '    print(result)'].join('\n');
  if (path === '/accounts/create') return [...prelude, '', start, '    result = client.accounts.create(username="YOUR_USERNAME", password="YOUR_PASSWORD", email="you@example.com")', '    print(result)'].join('\n');
  if (path === '/accounts/forgot_password' || path === '/accounts/reset_password') return authUnsupported.join('\n');

  if (path === '/characters/{name}') return [...prelude, '', start, '    result = client.characters.get("YOUR_CHARACTER_NAME")', '    print(result)'].join('\n');
  if (path === '/characters/active') return [...prelude, '', start, '    result = client.characters.get_active()', '    print(result)'].join('\n');
  if (path === '/characters/create') return [...prelude, 'from artifacts.models import CharacterSkin', '', start, '    result = client.characters.create(name="YOUR_CHARACTER_NAME", skin=CharacterSkin.MEN1)', '    print(result)'].join('\n');
  if (path === '/characters/delete') return [...prelude, '', start, '    result = client.characters.delete(name="YOUR_CHARACTER_NAME")', '    print(result)'].join('\n');

  if (path === '/items') return [...prelude, '', start, '    result = client.items.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/items/{code}') return [...prelude, '', start, '    result = client.items.get("copper_ore")', '    print(result)'].join('\n');
  if (path === '/monsters') return [...prelude, '', start, '    result = client.monsters.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/monsters/{code}') return [...prelude, '', start, '    result = client.monsters.get("chicken")', '    print(result)'].join('\n');

  if (path === '/maps') return [...prelude, '', start, '    result = client.maps.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/maps/{layer}') return [...prelude, '', start, '    result = client.maps.get_layer("overworld", page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/maps/{layer}/{x}/{y}') return [...prelude, '', start, '    result = client.maps.get_by_position("overworld", 0, 1)', '    print(result)'].join('\n');
  if (path === '/maps/id/{map_id}') return [...prelude, '', start, '    result = client.maps.get_by_id(101)', '    print(result)'].join('\n');

  if (path === '/resources') return [...prelude, '', start, '    result = client.resources.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/resources/{code}') return [...prelude, '', start, '    result = client.resources.get("copper_rocks")', '    print(result)'].join('\n');

  if (path === '/npcs/details') return [...prelude, '', start, '    result = client.npcs.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/npcs/details/{code}') return [...prelude, '', start, '    result = client.npcs.get("merchant")', '    print(result)'].join('\n');
  if (path === '/npcs/items') return [...prelude, '', start, '    result = client.npcs.get_all_items(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/npcs/items/{code}') return [...prelude, '', start, '    result = client.npcs.get_items("merchant", page=1, size=50)', '    print(result)'].join('\n');

  if (path === '/events') return [...prelude, '', start, '    result = client.events.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/events/active') return [...prelude, '', start, '    result = client.events.get_all_active(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/events/spawn') return authUnsupported.join('\n');

  if (path === '/achievements') return [...prelude, '', start, '    result = client.achievements.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/achievements/{code}') return [...prelude, '', start, '    result = client.achievements.get("first_fight")', '    print(result)'].join('\n');
  if (path === '/badges') return [...prelude, '', start, '    result = client.badges.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/badges/{code}') return [...prelude, '', start, '    result = client.badges.get("founder_2025")', '    print(result)'].join('\n');
  if (path === '/effects') return [...prelude, '', start, '    result = client.effects.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/effects/{code}') return [...prelude, '', start, '    result = client.effects.get("burn")', '    print(result)'].join('\n');

  if (path === '/tasks/list') return [...prelude, '', start, '    result = client.tasks.get_all(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/tasks/list/{code}') return [...prelude, '', start, '    result = client.tasks.get("chicken_hunt")', '    print(result)'].join('\n');
  if (path === '/tasks/rewards') return [...prelude, '', start, '    result = client.tasks.get_all_rewards(page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/tasks/rewards/{code}') return [...prelude, '', start, '    result = client.tasks.get_reward("task_coin_bag")', '    print(result)'].join('\n');

  if (path === '/grandexchange/orders') return [...prelude, '', start, '    result = client.grand_exchange.get_orders(code="copper_ore", page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/grandexchange/history/{code}') return [...prelude, '', start, '    result = client.grand_exchange.get_history("copper_ore", page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/grandexchange/orders/{id}') return [...prelude, '', start, '    result = client.grand_exchange.get_order("ORDER_ID")', '    print(result)'].join('\n');

  if (path === '/leaderboard/characters') return [...prelude, '', start, '    result = client.leaderboard.get_characters(sort="combat", page=1, size=50)', '    print(result)'].join('\n');
  if (path === '/leaderboard/accounts') return [...prelude, '', start, '    result = client.leaderboard.get_accounts(sort="gold", page=1, size=50)', '    print(result)'].join('\n');

  if (path === '/simulation/fight_simulation') {
    return [
      ...prelude,
      'from artifacts.models.sandbox import FakeCharacterSchema',
      '',
      start,
      '    fake = FakeCharacterSchema(level=20)',
      '    result = client.simulation.fight(characters=[fake], monster="ogre", iterations=10)',
      '    print(result)',
    ].join('\n');
  }

  return authUnsupported.join('\n');
}

function endpointSection(operation, pathItem, spec) {
  const auth = authMode(operation);
  const bodySchema = requestBodySchema(operation);
  const bodySample = bodySchema ? sampleValue(bodySchema, 'body', spec) : null;
  const url = buildUrl(operation, pathItem, spec);
  const rows = [];

  for (const param of normalizeParameters(pathItem, operation)) {
    const schema = expandSchema(param.schema, spec);
    rows.push({
      parameter: param.name,
      in: param.in,
      type: typeLabel(schema),
      required: param.required ? 'Yes' : 'No',
      description: param.description || schema?.description || '',
    });
  }
  if (bodySchema) rows.push(...bodyRows(bodySchema, operation.requestBody?.required ? 'Yes' : 'No', spec));
  if (rows.length === 0) rows.push({ parameter: 'None', in: '-', type: '-', required: '-', description: 'This endpoint has no parameters.' });

  const table = ['| Parameter | In | Type | Required | Description |', '|---|---|---|---|---|', ...rows.map((row) => `| ${escapeCell(row.parameter)} | ${escapeCell(row.in)} | ${escapeCell(row.type)} | ${escapeCell(row.required)} | ${escapeCell(row.description)} |`)];

  const title = operation.summary || operation.operationId;

  return [
    `### ${title}`,
    '',
    `**Endpoint:** \`${operation.method.toUpperCase()} ${operation.path}\``,
    '',
    `**Authentication:** ${auth === 'public' ? 'Public endpoint' : auth === 'basic' ? 'HTTP Basic authentication required' : 'Bearer token required'
    }`,
    '',
    '#### Parameters',
    '',
    ...table,
    '',
    '#### Examples',
    '',
    '<Tabs>',
    '  <TabItem label="cURL">',
    '  ```bash',
    curlSnippet(operation.method, url, auth, bodySample),
    '  ```',
    '  </TabItem>',
    '  <TabItem label="JavaScript" icon="seti:javascript">',
    '  ```js',
    jsSnippet(operation.method, url, auth, bodySample),
    '  ```',
    '  </TabItem>',
    '  <TabItem label="Python" icon="seti:python">',
    '  ```python',
    pySnippet(operation.method, url, auth, bodySample),
    '  ```',
    '  </TabItem>',
    '  <TabItem label="Python SDK" icon="seti:python">',
    '  ```python',
    sdkSnippetFor(operation),
    '  ```',
    '  </TabItem>',
    '</Tabs>',
    '',
    `[View API Reference](https://api.artifactsmmo.com/docs/#/operations/${operation.operationId})`,
    '',
    '---',
    '',
  ].join('\n');
}

function collectGroups(spec) {
  const operations = [];
  for (const [pathName, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      if (!op) continue;
      operations.push({
        ...op,
        method,
        path: pathName,
        tag: op.tags?.[0] || 'Untagged',
      });
    }
  }

  operations.sort((a, b) => {
    const ai = TAG_ORDER.includes(a.tag) ? TAG_ORDER.indexOf(a.tag) : 999;
    const bi = TAG_ORDER.includes(b.tag) ? TAG_ORDER.indexOf(b.tag) : 999;
    return ai - bi || a.tag.localeCompare(b.tag) || a.path.localeCompare(b.path) || a.method.localeCompare(b.method);
  });

  const groups = new Map();
  for (const op of operations) {
    if (!groups.has(op.tag)) groups.set(op.tag, []);
    groups.get(op.tag).push(op);
  }

  return groups;
}

function tagSlug(tag) {
  if (TAG_SLUGS[tag]) return TAG_SLUGS[tag];
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function sortedGroupEntries(groups) {
  return [...groups.entries()].sort(([a], [b]) => {
    const ai = TAG_ORDER.includes(a) ? TAG_ORDER.indexOf(a) : 999;
    const bi = TAG_ORDER.includes(b) ? TAG_ORDER.indexOf(b) : 999;
    return ai - bi || a.localeCompare(b);
  });
}

function categoryPagePath(tag) {
  return `/api_reference/${tagSlug(tag)}/`;
}

function buildIndexDoc(groupEntries) {
  const lines = [
    '---',
    'title: API Reference',
    'description: Endpoint-by-endpoint API reference, split by category.',
    '---',
    '',
    `This section is generated from the official OpenAPI spec: \`${OPENAPI_URL}\`.`,
    '',
    'Each category page includes:',
    '- parameter tables (`path`, `query`, `body`)',
    '- examples for `cURL`, `JavaScript`, `Python`, and `Python SDK`',
    '- direct links to full endpoint details in Swagger UI',
    '',
    'Pagination is documented separately in [Pagination](/api_guide/pagination/).',
    '',
    '## Categories',
    '',
    '| Category | Endpoints | Link |',
    '|---|---|---|',
  ];

  for (const [tag, items] of groupEntries) {
    lines.push(`| ${escapeCell(tag)} | ${items.length} | [Open](${categoryPagePath(tag)}) |`);
  }

  return lines.join('\n');
}

function buildCategoryDoc(tag, items, spec) {
  const lines = [
    '---',
    `title: ${tag} API Reference`,
    `description: Complete endpoint reference for the ${tag} category.`,
    '---',
    '',
    "import { Tabs, TabItem } from '@astrojs/starlight/components';",
    '',
  ];

  for (const op of items) {
    lines.push(endpointSection(op, spec.paths[op.path], spec));
  }

  return lines.join('\n');
}

function buildPaginationDoc() {
  return [
    '---',
    'title: Pagination',
    'description: How pagination works for Artifacts MMO API list endpoints.',
    '---',
    '',
    'Most "Get All" endpoints return paginated responses.',
    '',
    '| Parameter | Type | Description |',
    '|---|---|---|',
    '| `page` | integer | Page number (1-indexed). |',
    '| `size` | integer | Number of results per page (default usually `50`). |',
    '',
    'Example query:',
    '',
    '```text',
    'GET /items?page=2&size=100',
    '```',
    '',
    'Example response shape:',
    '',
    '```json',
    '{',
    '  "data": [ ... ],',
    '  "total": 184,',
    '  "page": 2,',
    '  "size": 100,',
    '  "pages": 2',
    '}',
    '```',
    '',
    'See [API Reference](/api_reference/) for endpoint-specific parameters.',
  ].join('\n');
}

async function main() {
  const response = await fetch(OPENAPI_URL);
  if (!response.ok) throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);

  const spec = JSON.parse(stripBom(await response.text()));
  const groups = collectGroups(spec);
  const groupEntries = sortedGroupEntries(groups);

  await fs.mkdir(API_REFERENCE_DIR, { recursive: true });

  const currentFiles = await fs.readdir(API_REFERENCE_DIR).catch(() => []);
  for (const file of currentFiles) {
    if (file.endsWith('.mdx')) {
      await fs.rm(path.join(API_REFERENCE_DIR, file), { force: true });
    }
  }

  await fs.writeFile(API_REFERENCE_INDEX, buildIndexDoc(groupEntries), 'utf8');

  for (const [tag, items] of groupEntries) {
    const file = path.join(API_REFERENCE_DIR, `${tagSlug(tag)}.mdx`);
    await fs.writeFile(file, buildCategoryDoc(tag, items, spec), 'utf8');
  }

  await fs.writeFile(PAGINATION_FILE, buildPaginationDoc(), 'utf8');
  await fs.rm(LEGACY_SINGLE_PAGE, { force: true });

  process.stdout.write(`Generated API reference section in ${API_REFERENCE_DIR}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
