export async function prepare(ctx) {
  return [
    {
      type: 'input',
      name: 'componentName',
      message: 'Component name (e.g., etcd)',
      default: 'etcd',
    },
    {
      type: 'input',
      name: 'enumKey',
      message: 'ComponentName enum key (e.g., Etcd)',
    },
  ];
}

export async function action(answers, ctx, helpers) {
  const {componentName, enumKey} = answers;
  const fieldName = helpers.camelize(componentName, false);
  const packageName = ctx.packageName;

  await helpers.addComponentToCom({
    importStatement: `import {EtcdComponent} from '${packageName}'`,
    enumKey,
    enumValue: componentName,
    staticFieldName: fieldName,
    staticFieldExpression: `new EtcdComponent()`,
    registerCall: `Runtime.registerComponent(ComponentName.${enumKey}, this.${fieldName})`,
  });

  const varPrefix = componentName.replace(/-/g, '_');
  await helpers.appendToConfigTemplate({
    section: 'components',
    defines: [
      `#define(${varPrefix}_host,string,${componentName} host)`,
    ],
    content: `${componentName}:
  etcd:
    hosts:
    - \$(${varPrefix}_host)
  ttl: 60
  prefix: \$(projectScope)`,
  });
}
