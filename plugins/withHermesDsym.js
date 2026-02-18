const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const HERMES_DSYM_PHASE_ID = 'A1B2C3D4E5F60718293A4B5C';
const HERMES_DSYM_PHASE_NAME = '[Hermes] Generate dSYM for archive';

const SHELL_SCRIPT = [
  '# Generate hermes dSYM for archive (fixes missing dSYM UUID warning)',
  '# Use Pre-built Hermes from Pods (same binary that gets embedded = same UUID)',
  'set -e',
  'HERMES_BINARY="${PODS_XCFRAMEWORKS_BUILD_DIR}/hermes-engine/Pre-built/hermes.framework/hermes"',
  'DSYM_OUTPUT="${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM"',
  'if [ "$CONFIGURATION" = "Release" ] && [ -f "$HERMES_BINARY" ]; then',
  '  mkdir -p "$(dirname "$DSYM_OUTPUT")"',
  '  dsymutil "$HERMES_BINARY" -o "$DSYM_OUTPUT"',
  'fi'
]
  .join('\\n')
  .replace(/"/g, '\\"');

/**
 * Añade una Run Script Build Phase que genera el dSYM de hermes.framework
 * con dsymutil para que el archive de Xcode lo incluya (evita el warning 90725).
 */
function withHermesDsym(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.platformProjectRoot;
      const pbxPath = path.join(
        projectRoot,
        'PortManagement.xcodeproj',
        'project.pbxproj'
      );

      if (!fs.existsSync(pbxPath)) {
        return cfg;
      }

      let content = fs.readFileSync(pbxPath, 'utf-8');

      if (content.includes(HERMES_DSYM_PHASE_NAME)) {
        return cfg;
      }

      const scriptPhase = [
        `\t\t${HERMES_DSYM_PHASE_ID} /* ${HERMES_DSYM_PHASE_NAME} */ = {`,
        '\t\t\tisa = PBXShellScriptBuildPhase;',
        '\t\t\tbuildActionMask = 2147483647;',
        '\t\t\tfiles = (',
        '\t\t\t);',
        '\t\t\tinputPaths = (',
        '\t\t\t\t"${PODS_XCFRAMEWORKS_BUILD_DIR}/hermes-engine/Pre-built/hermes.framework/hermes",',
        '\t\t\t);',
        `\t\t\tname = "${HERMES_DSYM_PHASE_NAME}";`,
        '\t\t\toutputPaths = (',
        '\t\t\t\t"${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM",',
        '\t\t\t);',
        '\t\t\trunOnlyForDeploymentPostprocessing = 0;',
        '\t\t\tshellPath = /bin/sh;',
        `\t\t\tshellScript = "${SHELL_SCRIPT}\\n";`,
        '\t\t\tshowEnvVarsInLog = 0;',
        '\t\t};'
      ].join('\n');

      content = content.replace(
        /(\/\* End PBXShellScriptBuildPhase section \*\/)/,
        `${scriptPhase}\n$1`
      );

      const buildPhasesInsert = `\n\t\t\t\t${HERMES_DSYM_PHASE_ID} /* ${HERMES_DSYM_PHASE_NAME} */,`;
      const targetRegex = /(buildPhases = \()([\s\S]*?)(\t\t\t\);\s*\n\s*buildRules)/;
      content = content.replace(targetRegex, (_, before, buildPhases, after) => {
        const trimmed = buildPhases.trimEnd();
        return `${before}${trimmed}${buildPhasesInsert}${after}`;
      });

      fs.writeFileSync(pbxPath, content);
      console.log('✅ [Hermes] Generate dSYM phase añadida al proyecto iOS');
      return cfg;
    }
  ]);
}

module.exports = withHermesDsym;
