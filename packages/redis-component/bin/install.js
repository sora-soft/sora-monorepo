export async function prepare(ctx) {
  return [
    {
      type: 'input',
      name: 'componentName',
      message: 'Component name (e.g., business-redis)',
      default: 'redis',
    },
    {
      type: 'input',
      name: 'enumKey',
      message: 'ComponentName enum key (e.g., BusinessRedis)',
    },
  ];
}

export async function action(answers, ctx, helpers) {
  const {componentName, enumKey} = answers;
  const fieldName = helpers.camelize(componentName, false);
  const packageName = ctx.packageName;

  await helpers.addComponentToCom({
    importStatement: `import {RedisComponent} from '${packageName}'`,
    enumKey,
    enumValue: componentName,
    staticFieldName: fieldName,
    staticFieldExpression: `new RedisComponent()`,
    registerCall: `Runtime.registerComponent(ComponentName.${enumKey}, this.${fieldName})`,
  });

  const varPrefix = componentName.replace(/-/g, '_');
  await helpers.appendToConfigTemplate({
    section: 'components',
    defines: [
      `#define(${varPrefix}_url,string,${componentName} URL)`,
      `#define(${varPrefix}_database,number,${componentName} database index)`,
    ],
    content: `${componentName}:
    url: \$(${varPrefix}_url)
    database: \$(${varPrefix}_database)`,
  });
}
