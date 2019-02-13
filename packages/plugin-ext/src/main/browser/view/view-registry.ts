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
import { ViewContainer, View } from '../../../common';
import { ApplicationShell } from '@theia/core/lib/browser';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { ViewsContainerWidget } from './views-container-widget';
import { TreeViewWidget } from './tree-views-main';

export interface ViewContainerRegistry {
    container: ViewContainer;
    area: ApplicationShell.Area;
    views: View[]
}

@injectable()
export class ViewRegistry {

    @inject(ApplicationShell)
    protected applicationShell: ApplicationShell;

    @inject(FrontendApplicationStateService)
    protected applicationStateService: FrontendApplicationStateService;

    private containersWidgets = new Map<string, ViewsContainerWidget>();
    private treeViewWidgets = new Map<string, TreeViewWidget>();

    registerViewContainer(location: string, viewContainer: ViewContainer): void {
        const registry: ViewContainerRegistry = {
            container: viewContainer,
            area: !ApplicationShell.isSideArea(location) ? 'left' : location,
            views: []
        };
        const widget = new ViewsContainerWidget(registry.container);
        if (!this.applicationShell.getTabBarFor(widget)) {
            this.applicationShell.addWidget(widget, {area: registry.area});
        }
        this.containersWidgets.set(registry.container.id, widget);
    }

    registerView(location: string, view: View): void {
        const widget = this.containersWidgets.get(location);
        if (!widget) {
            return;
        }
        widget.addView(view);
        const treeViewWidget = this.treeViewWidgets.get(view.id);
        if (treeViewWidget) {
            if (widget.hasView(view.id) && widget.addWidget(view.id, treeViewWidget)) {
                this.applicationShell.activateWidget(widget.id);
            }
        }
    }

    onRegisterTreeView(viewId: string, treeViewWidget: TreeViewWidget): void {
        this.treeViewWidgets.set(viewId, treeViewWidget);
        this.containersWidgets.forEach((containerWidget: ViewsContainerWidget) => {
            if (containerWidget.hasView(viewId) && containerWidget.addWidget(viewId, treeViewWidget)) {
                this.applicationShell.activateWidget(containerWidget.id);
            }
        });
    }
}
