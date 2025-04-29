// Basic types and interfaces
export type FormatOptions = {
  printWidth?: number;
  tabWidth?: number;
  useTabs?: boolean;
  singleQuote?: boolean;
  semi?: boolean;
};

export type MinifyOptions = Record<string, unknown>;

export type CodeLanguage = {
  label: string;
  value: string;
  format: {
    handler: (code: string, options?: FormatOptions) => Promise<string>;
    options?: FormatOptions;
  } | null;
  minify: {
    handler: (code: string, options?: MinifyOptions) => Promise<string>;
    options?: MinifyOptions;
  } | null;
};

// Format functions
export const formatHTML = async (code: string, options?: FormatOptions) => {
  const [prettier, pluginEstree, pluginHtml, pluginBabel, pluginPostcss] =
    await Promise.all([
      import("prettier/standalone").then((m) => m.default),
      import("prettier/plugins/estree").then((m) => m.default),
      import("prettier/plugins/html").then((m) => m.default),
      import("prettier/plugins/babel").then((m) => m.default),
      import("prettier/plugins/postcss").then((m) => m.default),
    ]);

  return prettier.format(code, {
    parser: "html",
    plugins: [pluginEstree, pluginHtml, pluginBabel, pluginPostcss],
    printWidth: options?.printWidth,
    tabWidth: options?.tabWidth,
    useTabs: options?.useTabs,
  });
};

export const formatCSS = async (code: string, options?: FormatOptions) => {
  const [prettier, pluginPostcss] = await Promise.all([
    import("prettier/standalone").then((m) => m.default),
    import("prettier/plugins/postcss").then((m) => m.default),
  ]);

  return prettier.format(code, {
    parser: "css",
    plugins: [pluginPostcss],
    printWidth: options?.printWidth,
    tabWidth: options?.tabWidth,
    useTabs: options?.useTabs,
  });
};

export const formatJavaScript = async (
  code: string,
  options?: FormatOptions
) => {
  const [prettier, pluginEstree, pluginBabel, pluginHtml] = await Promise.all([
    import("prettier/standalone").then((m) => m.default),
    import("prettier/plugins/estree").then((m) => m.default),
    import("prettier/plugins/babel").then((m) => m.default),
    import("prettier/plugins/html").then((m) => m.default),
  ]);

  return prettier.format(code, {
    parser: "babel",
    plugins: [pluginEstree, pluginBabel, pluginHtml],
    printWidth: options?.printWidth,
    tabWidth: options?.tabWidth,
    useTabs: options?.useTabs,
    singleQuote: options?.singleQuote,
    semi: options?.semi,
  });
};

export const formatTypeScript = async (
  code: string,
  options?: FormatOptions
) => {
  const [prettier, pluginEstree, pluginTypeScript, pluginHtml] =
    await Promise.all([
      import("prettier/standalone").then((m) => m.default),
      import("prettier/plugins/estree").then((m) => m.default),
      import("prettier/plugins/typescript").then((m) => m.default),
      import("prettier/plugins/html").then((m) => m.default),
    ]);

  return prettier.format(code, {
    parser: "typescript",
    plugins: [pluginEstree, pluginTypeScript, pluginHtml],
    printWidth: options?.printWidth,
    tabWidth: options?.tabWidth,
    useTabs: options?.useTabs,
    singleQuote: options?.singleQuote,
    semi: options?.semi,
  });
};

export const formatJSON = async (code: string, options?: FormatOptions) => {
  const [prettier, pluginEstree, pluginBabel] = await Promise.all([
    import("prettier/standalone").then((m) => m.default),
    import("prettier/plugins/estree").then((m) => m.default),
    import("prettier/plugins/babel").then((m) => m.default),
  ]);

  return prettier.format(code, {
    parser: "json",
    plugins: [pluginEstree, pluginBabel],
    printWidth: options?.printWidth,
    tabWidth: options?.tabWidth,
    useTabs: options?.useTabs,
  });
};

export const formatMarkdown = async (code: string, options?: FormatOptions) => {
  const [prettier, pluginMarkdown] = await Promise.all([
    import("prettier/standalone").then((m) => m.default),
    import("prettier/plugins/markdown").then((m) => m.default),
  ]);

  return prettier.format(code, {
    parser: "markdown",
    plugins: [pluginMarkdown],
    printWidth: options?.printWidth,
    tabWidth: options?.tabWidth,
    useTabs: options?.useTabs,
  });
};

export const formatYAML = async (code: string, options?: FormatOptions) => {
  const [prettier, pluginYaml] = await Promise.all([
    import("prettier/standalone").then((m) => m.default),
    import("prettier/plugins/yaml").then((m) => m.default),
  ]);

  return prettier.format(code, {
    parser: "yaml",
    plugins: [pluginYaml],
    printWidth: options?.printWidth,
    tabWidth: options?.tabWidth,
    useTabs: options?.useTabs,
  });
};

export const formatXML = async (code: string, options?: FormatOptions) => {
  const [prettier, pluginXml] = await Promise.all([
    import("prettier/standalone").then((m) => m.default),
    import("@prettier/plugin-xml").then((m) => m.default),
  ]);

  return prettier.format(code, {
    parser: "xml",
    plugins: [pluginXml],
    printWidth: options?.printWidth,
    tabWidth: options?.tabWidth,
    useTabs: options?.useTabs,
  });
};

export const formatSQL = async (code: string, options?: FormatOptions) => {
  const [prettier, pluginSql] = await Promise.all([
    import("prettier/standalone").then((m) => m.default),
    import("prettier-plugin-sql").then((m) => m.default),
  ]);

  return prettier.format(code, {
    parser: "sql",
    plugins: [pluginSql],
    printWidth: options?.printWidth,
    tabWidth: options?.tabWidth,
    useTabs: options?.useTabs,
  });
};

// Minify functions
export const minifyHTML = async (code: string) => {
  const { minify } = await import("@/lib/vendor/htmlminifier.esm.bundle.js");

  const result = await minify(code, {
    collapseWhitespace: true,
    continueOnParseError: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });

  return result || code;
};

export const minifyCSS = async (code: string) => {
  const { minify } = await import("csso");
  const result = minify(code, {
    comments: false,
  });

  return result.css || code;
};

export const minifyJavaScript = async (code: string) => {
  const { minify } = await import("terser");
  const result = await minify(code, {
    format: {
      comments: false,
    },
  });

  return result.code || code;
};

export const minifyJSON = async (code: string) => {
  try {
    return JSON.stringify(JSON.parse(code));
  } catch {
    return code;
  }
};

// Language definitions with supported features
export const languages: CodeLanguage[] = [
  {
    label: "HTML",
    value: "html",
    format: {
      handler: formatHTML,
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      },
    },
    minify: {
      handler: minifyHTML,
    },
  },
  {
    label: "CSS",
    value: "css",
    format: {
      handler: formatCSS,
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      },
    },
    minify: {
      handler: minifyCSS,
    },
  },
  {
    label: "JavaScript",
    value: "javascript",
    format: {
      handler: formatJavaScript,
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        semi: true,
      },
    },
    minify: {
      handler: minifyJavaScript,
    },
  },
  {
    label: "TypeScript",
    value: "typescript",
    format: {
      handler: formatTypeScript,
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        semi: true,
      },
    },
    minify: null,
  },
  {
    label: "JSON",
    value: "json",
    format: {
      handler: formatJSON,
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      },
    },
    minify: {
      handler: minifyJSON,
    },
  },
  {
    label: "XML",
    value: "xml",
    format: {
      handler: formatXML,
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      },
    },
    minify: null,
  },
  {
    label: "YAML",
    value: "yaml",
    format: {
      handler: formatYAML,
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      },
    },
    minify: null,
  },
  {
    label: "Markdown",
    value: "markdown",
    format: {
      handler: formatMarkdown,
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      },
    },
    minify: null,
  },
  {
    label: "SQL",
    value: "sql",
    format: {
      handler: formatSQL,
      options: {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      },
    },
    minify: null,
  },
];
