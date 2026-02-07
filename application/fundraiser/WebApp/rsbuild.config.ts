import { DevelopmentServerPlugin } from "@repo/build/plugin/DevelopmentServerPlugin";
import { FileSystemRouterPlugin } from "@repo/build/plugin/FileSystemRouterPlugin";
import { LinguiPlugin } from "@repo/build/plugin/LinguiPlugin";
import { ModuleFederationPlugin } from "@repo/build/plugin/ModuleFederationPlugin";
import { RunTimeEnvironmentPlugin } from "@repo/build/plugin/RunTimeEnvironmentPlugin";
import { TailwindPlugin } from "@repo/build/plugin/TailwindPlugin";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";

const customBuildEnv: CustomBuildEnv = {};

export default defineConfig({
  dev: {
    lazyCompilation: false
  },
  security: {
    nonce: "{{cspNonce}}"
  },
  tools: {
    rspack: {
      watchOptions: {
        ignored: ["**/tests/**", "**/playwright-report/**"]
      }
    }
  },
  plugins: [
    TailwindPlugin("#fundraiser"),
    pluginReact(),
    pluginTypeCheck(),
    pluginSvgr(),
    FileSystemRouterPlugin(),
    RunTimeEnvironmentPlugin(customBuildEnv),
    LinguiPlugin(),
    DevelopmentServerPlugin({ port: 9301 }),
    ModuleFederationPlugin({
      remotes: {
        "account-management": { port: 9101 }
      }
    })
  ]
});
