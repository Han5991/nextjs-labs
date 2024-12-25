#!/usr/bin/env node

import { Command, Option } from 'commander';

class AuroraRootCommand extends Command {
  createCommand(name: string) {
    const command = new Command(name);

    command.addOption(new Option('--inspect').hideHelp());

    command.hook('preAction', event => {
      const commandName = event.name();
      const defaultEnv = commandName === 'dev' ? 'development' : 'production';
      const standardEnv = ['production', 'development', 'test'];

      if (process.env.NODE_ENV) {
        const isNotStandard = !standardEnv.includes(process.env.NODE_ENV);
        const shouldWarnCommands =
          process.env.NODE_ENV === 'development'
            ? ['start', 'build']
            : process.env.NODE_ENV === 'production'
              ? ['dev']
              : [];

        if (isNotStandard || shouldWarnCommands.includes(commandName)) {
          console.warn(
            `귀하의 환경에서 비표준 "NODE_ENV" 값을 사용하고 있습니다. 이로 인해 프로젝트에 불일치가 발생하므로 이에 대해 강력히 권고합니다.`,
          );
        }
      }

      (process.env as any).NODE_ENV = process.env.NODE_ENV || defaultEnv;
      (process.env as any).NEXT_RUNTIME = 'nodejs';
    });

    return command;
  }
}

const program = new AuroraRootCommand();

program
  .command('dev', { isDefault: true })
  .description('Start the development server')
  .addOption(
    new Option(
      '-p, --port <port>',
      'Specify a port number on which to start the application.',
    ).default(3000),
  )
  .action(({ port }: { port: number }) => {
    import('../cli/aurora-dev').then(mod => mod.auroraDev(port));
  });

program.parse(process.argv);
