import { Command, flags } from '@oclif/command';
import * as fs from 'fs';
import * as chalk from 'chalk';

interface BreakingChange {
  passing: boolean;
  lookup: string;
  files: string[];
  link: string;
  message: string;
}

class KojiCoreProjectScan extends Command {
  static description = 'describe the command here';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    // add --ignore-dir flag to ignore certain directories
    'ignore-dir': flags.string({
      multiple: true,
    }),
  };

  async run() {
    const {
      flags: { 'ignore-dir': ignoreDirectories = [] },
    } = this.parse(KojiCoreProjectScan);

    const rootDir = process.cwd();

    const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
      const files = fs.readdirSync(dirPath);

      files.forEach((file: string) => {
        let validDirPath = true;

        ignoreDirectories.forEach((ignoreDirectory) => {
          if (dirPath.includes(ignoreDirectory)) validDirPath = false;
        });

        if (validDirPath) {
          if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
            arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
          } else {
            arrayOfFiles.push(`${dirPath}/${file}`);
          }
        }
      });

      return arrayOfFiles;
    };

    // Middleware breaking change
    const middlewareBreakingChange: BreakingChange = {
      passing: true,
      lookup: '(KojiBackend.middleware)',
      files: [],
      link: 'https://github.com/madewithkoji/koji-core/releases/tag/v0.0.12',
      message: 'Middleware Breaking Change',
    };

    // Receipts lookup breaking change
    const receiptsBreakingChange: BreakingChange = {
      passing: true,
      lookup: 'resolveReceiptsByUserToken',
      files: [],
      link: 'https://github.com/madewithkoji/koji-core/releases/tag/v0.0.14',
      message: 'Receipts Breaking Change',
    };

    // Koji capture breaking change
    const kojiCaptureBreakingChange: BreakingChange = {
      passing: true,
      lookup: 'Koji.ui.capture.koji',
      files: [],
      link: 'https://github.com/madewithkoji/koji-core/releases/tag/v1.0.0',
      message: 'Koji Capture Breaking Change',
    };

    // Koji capture breaking change
    const soundCaptureBreakingChange: BreakingChange = {
      passing: true,
      lookup: 'Koji.ui.capture.sound',
      files: [],
      link: 'https://github.com/madewithkoji/koji-core/releases/tag/v1.0.0',
      message: 'Sound Capture Breaking Change',
    };

    // Get token breaking change
    const getTokenBreakingChange: BreakingChange = {
      passing: true,
      lookup: 'const token = await Koji.identity',
      files: [],
      link: 'https://github.com/madewithkoji/koji-core/releases/tag/v1.0.0',
      message: 'Get Token Signature Breaking Change',
    };

    const breakingChanges = [
      middlewareBreakingChange,
      receiptsBreakingChange,
      kojiCaptureBreakingChange,
      soundCaptureBreakingChange,
      getTokenBreakingChange,
    ];

    const allFiles = getAllFiles(rootDir);

    allFiles.forEach((file) => {
      const data = fs.readFileSync(file, 'utf8');

      if (data) {
        breakingChanges.forEach((breakingChange) => {
          if (data.includes(breakingChange.lookup)) {
            breakingChange.passing = false;
            breakingChange.files = [...breakingChange.files, file];
          }
        });
      }
    });

    this.log(' ');

    breakingChanges
      .sort((a, b) => (a.passing ? 0 : 1) - (b.passing ? 0 : 1))
      .forEach((breakingChange) => {
        if (breakingChange.passing) {
          this.log(chalk.green(`${breakingChange.message}: No Issues Detected`));
        } else {
          this.log(' ');
          this.log(chalk.red(`${breakingChange.message}: Issues Detected`));
          this.log('');
          this.log('Detected in:');
          breakingChange.files.forEach((file) => {
            this.log(`  - ${file}`);
          });
          this.log('');
          this.log(`More info: ${breakingChange.link}`);
          this.log(' ');
          this.log(' ');
        }
      });
  }
}

export = KojiCoreProjectScan;
