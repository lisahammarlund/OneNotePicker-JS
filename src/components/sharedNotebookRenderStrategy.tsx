import * as React from 'react';

import { SectionRenderStrategy } from './sectionRenderStrategy';
import { SectionGroupRenderStrategy } from './sectionGroupRenderStrategy';
import { ExpandableNodeRenderStrategy } from './treeView/expandableNodeRenderStrategy';
import { ExpandableNode } from './treeView/expandableNode';
import { LeafNode } from './treeView/leafNode';
import { Constants } from '../constants';
import { Strings } from '../strings';
import { SharedNotebook } from '../oneNoteDataStructures/sharedNotebook';
import { InnerGlobals } from '../props/globalProps';
import { OneNoteItemUtils } from '../oneNoteDataStructures/oneNoteItemUtils';
import { NotebookOpenedIconSvg } from './icons/notebookOpenedIcon.svg';
import { NotebookClosedIconSvg } from './icons/notebookClosedIcon.svg';
import { SpinnerIconSvg} from './icons/spinnerIcon.svg';
import {ChevronSvg} from './icons/chevron.svg';

export class SharedNotebookRenderStrategy implements ExpandableNodeRenderStrategy {
	onClickBinded = this.onClick.bind(this);
	onExpandBinded = this.onExpand.bind(this);

	constructor(private notebook: SharedNotebook, private globals: InnerGlobals) { }

	element(): JSX.Element {
		return (
			<div className={this.isSelected() ? 'picker-selectedItem shared-notebook' : 'shared-notebook'} title={this.breadcrumbs() + '/' + this.notebook.name}>
				<div className={this.isExpanded() ? 'chevron-icon opened' : 'chevron-icon closed'}>
					<ChevronSvg />
				</div>
				<div className='picker-icon'>
					{this.isExpanded() ? <NotebookOpenedIconSvg/> : <NotebookClosedIconSvg/>}
				</div>
				<div className='picker-label'>
					<label>{this.notebook.name}</label>
					<label className='breadcrumbs'>{this.breadcrumbs()}</label>
				</div>
				<div className='picker-shared-icon'>
					<span aria-hidden='true'>{Strings.get('Shared', this.globals.strings)}</span>
					<i className='ms-Icon ms-Icon--People'/>
				</div>
			</div>);
	}

	getId(): string {
		return this.notebook.webUrl;
	}

	getName(): string {
		return this.notebook.name;
	}

	getChildren(childrenLevel: number): JSX.Element[] {
		if (typeof(this.notebook.apiHttpErrorCode) === 'number') {
			let errorString = Strings.getError(this.notebook.apiHttpErrorCode, this.globals.strings);
			return [
				<li role='status' aria-live='polite' aria-label={errorString} className='progress-row'>
					<div>{errorString}</div>
				</li>
			];
		}

		if (!this.notebook.apiProperties) {
			return [
				<li className='progress-row'>
					<SpinnerIconSvg />
				</li>
			];
		}

		let sectionGroupRenderStrategies = this.notebook.apiProperties.spSectionGroups.map(sectionGroup => new SectionGroupRenderStrategy(sectionGroup, this.globals));
		let sectionGroups = sectionGroupRenderStrategies.map(renderStrategy =>
			!!this.globals.callbacks.onSectionSelected || !!this.globals.callbacks.onPageSelected ?
				<ExpandableNode
					expanded={renderStrategy.isExpanded()} node={renderStrategy} globals={this.globals}
					treeViewId={Constants.TreeView.id} key={renderStrategy.getId()}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()} /> :
				<LeafNode node={renderStrategy} treeViewId={Constants.TreeView.id} key={renderStrategy.getId()} globals={this.globals}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()} />);

		let sectionRenderStrategies = this.notebook.apiProperties.spSections.map(section => new SectionRenderStrategy(section, this.globals));
		let sections = sectionRenderStrategies.map(renderStrategy =>
			!!this.globals.callbacks.onPageSelected ?
				<ExpandableNode
					expanded={renderStrategy.isExpanded()} node={renderStrategy} globals={this.globals}
					treeViewId={Constants.TreeView.id} key={renderStrategy.getId() }
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()} /> :
				<LeafNode node={renderStrategy} treeViewId={Constants.TreeView.id} key={renderStrategy.getId()} globals={this.globals}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()} />);

		return sectionGroups.concat(sections);
	}

	isExpanded(): boolean {
		return this.notebook.expanded;
	}

	isSelected(): boolean {
		return this.notebook.apiProperties ? this.globals.selectedId === this.notebook.apiProperties.id : false;
	}

	isAriaSelected(): boolean {
		return this.globals.ariaSelectedId ? this.globals.ariaSelectedId === this.getId() : false;
	}

	private onClick() {
		let { onNotebookSelected } = this.globals.callbacks;

		if (!!onNotebookSelected) {
			onNotebookSelected(this.notebook, OneNoteItemUtils.getAncestry(this.notebook));
		}

		if (this.globals.callbacks.onSectionSelected || this.globals.callbacks.onPageSelected) {
			this.notebook.expanded = !this.notebook.expanded;
		}
	}

	private onExpand() {
		if (this.isExpandable()) {
			if (!this.notebook.apiProperties && !this.notebook.startedLoading) {
				// This notebook was made known to us by GetRecentNotebooks, but we haven't
				// fetched any metadata or children info
				this.notebook.startedLoading = true;
				const depth = this.globals.notebookExpandDepth || 5;
				this.globals.oneNoteDataProvider.getSpNotebookProperties(this.notebook, depth, true).then((apiProperties) => {
					if (!apiProperties) {
						this.notebook.apiHttpErrorCode = 404;
						return;
					}

					this.notebook.apiProperties = apiProperties;

					if (this.globals.notebookListUpdater) {
						this.globals.notebookListUpdater.updateNotebookList([this.notebook]);
					}
				}).catch((xhrs: XMLHttpRequest[]) => {
					let max = 0;
					for (let i = 0; i < xhrs.length; i++) {
						max = Math.max(xhrs[i].status, max);
					}
					this.notebook.apiHttpErrorCode = max;
				}).then(() => {
					let { onSharedNotebookInfoReturned } = this.globals.callbacks;
					if (!!onSharedNotebookInfoReturned) {
						onSharedNotebookInfoReturned(this.notebook);
					}
				});
			}
		}
	}

	private breadcrumbs(): string {
		let url = this.notebook.webUrl;
		let split = url.split('/');
		return split.slice(3, -1).map(decodeURIComponent).join('/');
	}

	private isExpandable(): boolean {
		return !!this.globals.callbacks.onSectionSelected || !!this.globals.callbacks.onPageSelected;
	}
}