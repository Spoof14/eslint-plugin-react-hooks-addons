'use strict';

const rule = require('../../lib/rules/no-unused-deps');
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 'latest' } });

const getError = (
  unusedDeps,
  { hook = 'useEffect', effectComment = 'effect dep' } = {}
) => ({
  messageId: 'unused',
  data: { unusedDeps, hook, effectComment },
  type: 'ArrayExpression'
});

ruleTester.run('no-unused-deps', rule, {
  valid: [
    `
      useEffect(() => {
          document.title = usedVar;
      }, [usedVar]);
    `,
    `
      useEffect(() => {
          document.title = usedVar;
      }, [usedVar, /* effect dep */ effectVar]);
    `
  ],

  invalid: [
    {
      code: `
        useLayoutEffect(() => {
            document.title = usedVar;
        }, [usedVar, unusedVar]);
      `,
      errors: [getError("'unusedVar'", { hook: 'useLayoutEffect' })]
    },
    {
      code: `
        useEffect(() => {
            document.title = usedVar;
        }, [usedVar, unusedVar, /* effect dep */ effectVar]);
      `,
      errors: [getError("'unusedVar'")]
    },
    {
      code: `
        useEffect(() => {
            document.title = usedVar;
        }, [usedVar, unusedVar, /* effectful */ effectVar, /* effect dep */ ineffectVar]);
      `,
      options: [{ customComment: 'effectful' }],
      errors: [getError("'unusedVar', 'ineffectVar'", { effectComment: 'effectful' })]
    },
    {
      code: `
        useEffect(() => {
            const shadowedVar = usedVar;
            document.title = shadowedVar;
        }, [usedVar, unusedVar, /* effect dep */ effectVar, shadowedVar]);
      `,
      errors: [getError("'unusedVar', 'shadowedVar'")]
    },
    {
      code: `
        useEffect(() => {
            const nested = () => {
                document.title = usedVar;
            };
            nested();
        }, [usedVar, unusedVar]);
      `,
      errors: [getError("'unusedVar'")]
    }
  ]
});
