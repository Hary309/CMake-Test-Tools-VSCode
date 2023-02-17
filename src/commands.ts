/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { Commands, GlobalVars } from "./constant";
import { runCommand } from "./terminal";

const commands = {
  [Commands.RunTest]: (args: any[]) => {
    vscode.window.showInformationMessage(
      "Building Test..." + JSON.stringify(args)
    );

    vscode.commands.executeCommand("cmake.build").then((target) => {
      vscode.commands
        .executeCommand("cmake.getLaunchTargetPath")
        .then((target) => {
          runCommand([target, GlobalVars.testParam].join(" "));
        });
    });
  },
  [Commands.DebugTest]: () => {
    vscode.window.showInformationMessage("Debuging Test...");

    vscode.debug.startDebugging(undefined, {
      type: "lldb",
      request: "launch",
      name: "Debug",
      program: "${command:cmake.launchTargetPath}",
      args: ["${command:cmake-test-tools.getTestParam}"],
      cwd: "${workspaceFolder}",
    });
  },
  [Commands.GetTestParam]: () => {
    return GlobalVars.testParam;
  },
  [Commands.DiscoverTests]: () => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Discovering Tests...",
        cancellable: true,
      },
      (progress, token) => {
        token.onCancellationRequested(() => {
          vscode.window.showInformationMessage("You canceled discovering.");
        });

        return new Promise<void>((resolve) => {
          function fakeUpdate(val = 0) {
            if (val < 100) {
              setTimeout(() => {
                fakeUpdate(val + 10);
              }, 200);
            } else {
              resolve();
            }

            progress.report({ message: `${val}%`, increment: 10 });
          }

          fakeUpdate();
        });
      }
    );
  },
};

export function registerAllCommands(ctx: vscode.ExtensionContext) {
  for (const commandName in commands) {
    console.log("create command", commandName);

    const commandItem = vscode.commands.registerCommand(
      commandName,
      commands[commandName as Commands]
    );

    ctx.subscriptions.push(commandItem);
  }
}
