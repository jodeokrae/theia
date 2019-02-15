/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, inject } from 'inversify';
import { CommandContribution, CommandRegistry, Command } from '@theia/core';
import { CommandService } from '@theia/core/lib/common/command';
import TheiaURI from '@theia/core/lib/common/uri';
import URI from 'vscode-uri';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { DiffService } from '@theia/workspace/lib/browser/diff-service';

export namespace VscodeCommands {
    export const OPEN: Command = {
        id: 'vscode.open',
        label: 'VSCode open link'
    };

    export const DIFF: Command = {
       id: 'vscode.diff',
       label: 'VSCode diff'
    };

    export const SET_CONTEXT: Command = {
        id: 'setContext'
    };
}

@injectable()
export class PluginVscodeCommandsContribution implements CommandContribution {
    @inject(CommandService)
    protected readonly commandService: CommandService;
    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;
    @inject(DiffService)
    protected readonly diffService: DiffService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(VscodeCommands.OPEN, {
            isVisible: () => false,
            execute: (resource: URI) => {
                this.commandService.executeCommand('theia.open', new TheiaURI(resource));
            }
        });

        commands.registerCommand(VscodeCommands.DIFF, {
            isVisible: () => true,
            // tslint:disable-next-line: no-any
            execute: async uris => {
                const [left, right] = uris;
                await this.diffService.openDiffEditor(left, right);
            }
        });

        commands.registerCommand(VscodeCommands.SET_CONTEXT, {
            isVisible: () => false,
            // tslint:disable-next-line: no-any
            execute: (contextKey: any, contextValue: any) => {
                this.contextKeyService.createKey(String(contextKey), contextValue);
            }
        });
    }
}
