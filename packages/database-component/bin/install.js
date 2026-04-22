export async function prepare(ctx) {
  return [
    {
      type: 'input',
      name: 'componentName',
      message: 'Component name (e.g., business-database)',
      default: 'database',
    },
    {
      type: 'input',
      name: 'enumKey',
      message: 'ComponentName enum key (e.g., BusinessDB)',
      default: 'BusinessDB'
    },
    {
      type: 'input',
      name: 'migrationPath',
      message: 'Where to put migration files?',
      default: 'app/database/migration',
    },
  ];
}

export async function action(answers, ctx, helpers) {
  const { componentName, enumKey, migrationPath } = answers;
  const fieldName = helpers.camelize(componentName, false);
  const packageName = ctx.packageName;

  await helpers.addComponentToCom({
    importStatement: `import {DatabaseComponent} from '${packageName}'`,
    enumKey,
    enumValue: componentName,
    staticFieldName: fieldName,
    staticFieldExpression: `new DatabaseComponent([])`,
    registerCall: `Runtime.registerComponent(ComponentName.${enumKey}, this.${fieldName})`,
  });

  if (migrationPath) {
    await helpers.ensureDir(migrationPath);

    await helpers.mergeJSON(
      '../sora.json',
      {
        migration: 'app/database/migration',
        databaseDir: 'app/database',
      },
    );
  }

  const varPrefix = componentName.replace(/-/g, '_');
  await helpers.appendToConfigTemplate({
    section: 'components',
    defines: [
      `#define(${varPrefix}_type,select:[mysql|postgres|mariadb|sqlite],${componentName} database type)`,
      `#define(${varPrefix}_host,string,${componentName} database host)`,
      `#define(${varPrefix}_port,number,${componentName} database port)`,
      `#define(${varPrefix}_username,string,${componentName} database username)`,
      `#define(${varPrefix}_password,password,${componentName} database password)`,
      `#define(${varPrefix}_database,string,${componentName} database name)`,
    ],
    content: `${componentName}:
    database:
      type: \$(${varPrefix}_type)
      host: \$(${varPrefix}_host)
      port: \$(${varPrefix}_port)
      username*: \$(${varPrefix}_username)
      password*: \$(${varPrefix}_password)
      database: \$(${varPrefix}_database)`,
  });

  helpers.log('! Add TypeORM entities to DatabaseComponent constructor in Com.ts');
}
