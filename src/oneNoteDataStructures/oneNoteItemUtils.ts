import { Notebook } from './notebook';
import { OneNoteItem } from './oneNoteItem';
import { Section } from './section';
import { SectionGroup } from './sectionGroup';
import { SharedNotebook } from './sharedNotebook';
import { Polyfills } from '../polyfills';

Polyfills.find();

export class OneNoteItemUtils {
	/**
	 * Given the id of the OneNoteItem, and a notebook or sectionGroup list, returns
	 * the OneNoteItem in the hierarchy that has the same id, or undefined
	 * if it can't be found.
	 */
	static find(sectionParents: (Notebook | SectionGroup)[], predicate: (item: OneNoteItem) => boolean): OneNoteItem | undefined {
		let findResult: OneNoteItem | undefined = sectionParents.find(predicate);
		if (!!findResult) {
			return findResult;
		}

		for (let i = 0; i < sectionParents.length; i++) {
			// For shared notebook we need to look at api properties
			const sectionParent = sectionParents[i];
			const sectionParentNotebook = sectionParent as SharedNotebook;
			let sectionGroups: SectionGroup[];
			let sections: Section[];
			if (sectionParentNotebook.apiProperties) {
				sectionGroups = sectionParentNotebook.apiProperties.spSectionGroups;
				sections = sectionParentNotebook.apiProperties.spSections;
			} else {
				if (!sectionParent.sections || !sectionParent.sectionGroups) {
					continue;
				}

				sectionGroups = sectionParent.sectionGroups;
				sections = sectionParent.sections;
			}
			
			findResult = OneNoteItemUtils.find(sectionGroups, predicate);
			if (!!findResult) {
				return findResult;
			}

			findResult = OneNoteItemUtils.findInSections(sections, predicate);
			if (!!findResult) {
				return findResult;
			}
		}

		return undefined;
	}

	/**
	 * Given the id of the OneNoteItem, and a section list, returns the OneNoteItem in
	 * the hierarchy that has the same id, or undefined if it can't be found.
	 */
	static findInSections(sections: Section[], predicate: (item: OneNoteItem) => boolean): OneNoteItem | undefined {
		let findResult: OneNoteItem | undefined = sections.find(predicate);
		if (!!findResult) {
			return findResult;
		}

		for (let i = 0; i < sections.length; i++) {
			const pages = sections[i].pages;
			if (!!pages) {
				findResult = pages.find(predicate);
				if (!!findResult) {
					return findResult;
				}
			}
		}

		return undefined;
	}

	/**
	 * Given a predicate and a notebook hierarchy, expands to the first item that
	 * satisfies the predicate if it exists in the hierarchy.
	 */
	static expandTo(notebooks: Notebook[], predicate: (item: OneNoteItem) => boolean) {
		const item = OneNoteItemUtils.find(notebooks, predicate);
		if (!!item) {
			const ancestry = OneNoteItemUtils.getAncestry(item);
			for (let i = 0; i < ancestry.length - 1; i++) {
				// We know everything until the last item has to be one of these three types, regardless
				// of the item itself, as they have to be parents
				const expandable = ancestry[i] as Notebook | SectionGroup | Section;
				expandable.expanded = true;
			}
		}
	}

	/**
	 * Performs a depth-first traversal on the item, pruning any of its child section groups
	 * if they do not have a descendent section, and returning true if this item has at least
	 * one descendent section; false otherwise.
	 */
	static prune(root: Notebook | SectionGroup): boolean {
		if (!root.sections || !root.sectionGroups) {
			return false
		}

		root.sectionGroups = root.sectionGroups.filter(OneNoteItemUtils.prune);
		return root.sectionGroups.length > 0 || root.sections.length > 0;
	}

	/**
	 * Given a OneNote item, returns a list representing the item's
	 * ancestry, starting from the root notebook.
	 */
	static getAncestry(item: OneNoteItem): OneNoteItem[] {
		let current = item;

		const ancestry = [current];
		while (!!current.parent) {
			current = current.parent;
			ancestry.unshift(current);
		}

		return ancestry;
	}
}
