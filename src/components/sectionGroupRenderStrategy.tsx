import * as React from 'react';

import {SectionRenderStrategy} from './sectionRenderStrategy';
import {ExpandableNodeRenderStrategy} from './treeView/expandableNodeRenderStrategy';
import {ExpandableNode} from './treeView/expandableNode';
import {LeafNode} from './treeView/leafNode';
import {Constants} from '../constants';
import {Strings} from '../strings';
import {SectionGroup} from '../oneNoteDataStructures/sectionGroup';
import {InnerGlobals} from '../props/globalProps';

export class SectionGroupRenderStrategy implements ExpandableNodeRenderStrategy {
	onClickBinded = this.onClick.bind(this);

	constructor(private sectionGroup: SectionGroup, private globals: InnerGlobals) { }
	
	element(): JSX.Element {
		return (
			<div title={this.sectionGroup.name}>
				<div className='picker-icon-left'>
					<img
						src={require('../images/sectiongroup_icon.png')}
						alt={Strings.get('Accessibility.SectionGroupIcon', this.globals.strings)}/>
				</div>
				<div>
					<label className='ms-fontSize-sPlus'>{this.sectionGroup.name}</label>
				</div>
			</div>);
	}

	getName(): string {
		return this.sectionGroup.name;
	}

	getId(): string {
		return this.sectionGroup.id;
	}

	getChildren(childrenLevel: number): JSX.Element[] {
		let sectionGroupRenderStrategies = this.sectionGroup.sectionGroups.map(sectionGroup => new SectionGroupRenderStrategy(sectionGroup, this.globals));
		let sectionGroups = sectionGroupRenderStrategies.map(renderStrategy =>
			!!this.globals.callbacks.onSectionSelected || !!this.globals.callbacks.onPageSelected ?
				<ExpandableNode
					expanded={renderStrategy.isExpanded()} node={renderStrategy} globals={this.globals}
					treeViewId={Constants.TreeView.id} key={renderStrategy.getId()}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()}></ExpandableNode> :
				<LeafNode node={renderStrategy} treeViewId={Constants.TreeView.id} key={renderStrategy.getId()} globals={this.globals}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()}></LeafNode>);

		let sectionRenderStrategies = this.sectionGroup.sections.map(section => new SectionRenderStrategy(section, this.globals));
		let sections = sectionRenderStrategies.map(renderStrategy =>
			!!this.globals.callbacks.onPageSelected ?
				<ExpandableNode expanded={renderStrategy.isExpanded()} node={renderStrategy} globals={this.globals}
					treeViewId={Constants.TreeView.id} key={renderStrategy.getId()}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()}></ExpandableNode> :
				<LeafNode node={renderStrategy} treeViewId={Constants.TreeView.id} key={renderStrategy.getId()} globals={this.globals}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()}></LeafNode>);

		return sectionGroups.concat(sections);
	}

	isExpanded(): boolean {
		return this.sectionGroup.expanded;
	}

	isSelected(): boolean {
		return false;
	}

	isAriaSelected(): boolean {
		return this.globals.ariaSelectedId ? this.globals.ariaSelectedId === this.getId() : false;
	}

	private onClick() {
		// No additional functionality
	}
}
