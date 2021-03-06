import { OneNoteItem } from '../oneNoteDataStructures/oneNoteItem';
import { Notebook } from '../oneNoteDataStructures/notebook';
import { Section } from '../oneNoteDataStructures/section';
import { SharedNotebook } from '../oneNoteDataStructures/sharedNotebook';
import { Page } from '../oneNoteDataStructures/page';
import { SectionGroup } from '../oneNoteDataStructures/sectionGroup';

/**
 * Represents a set of callbacks that the application can register to be
 * notified whenever an 'interesting' synchronous or asynchronous user action
 * happens. The rendering application can choose to act on this new information
 * (e.g., a re-render of the OneNotePicker, logging). If a selection callback
 * is specified for a particular OneNote item type, the picker will assume that
 * it is selectable. If a selection callback is not specified, the picker will
 * assume the opposite. The picker will only allow items to be expandable until
 * the deepest selectable object. There should be at least one selection callback
 * specified.
 */
export interface OneNotePickerCallbacks {
	onNotebookHierarchyUpdated: (notebooks: Notebook[]) => void;

	// Shared notebooks have to be loaded on demand, as we only have their URLs and names
	// to begin with. This is because getting sections for a shared notebook is expensive.
	onSharedNotebookInfoReturned?: (sharedNotebook: SharedNotebook) => void;
	onNotebookInfoReturned?: (notebook: Notebook) => void;

	// Selection callbacks
	onNotebookSelected?: (notebook: Notebook, breadcrumbs: OneNoteItem[]) => void;
	onRecentSectionSelected?: (section: Section, breadcrumbs: OneNoteItem[]) => void;
	onSectionSelected?: (section: Section, breadcrumbs: OneNoteItem[]) => void;
	onPageSelected?: (page: Page, breadcrumbs: OneNoteItem[]) => void;

	// Accessibility callbacks
	onAccessibleSelection: (selectedItemId: string) => void;
	
	// Create entity callbacks
	// TODO (machiam) Disallowing creating a notebook after the first one is easy. With sections,
	// since they are disallowed on a per-notebook basis, is more difficult
	onNotebookCreated?: (notebook: Notebook) => void;
	onSectionCreated?: (section: Section) => void;

	onNotebookInputValueChanged?: (name: string) => void;
	onNotebookInputSelected?: () => void;
	onSectionInputValueChanged?: (name: string) => void;
	onSectionInputSelected?: (parent: Notebook | SectionGroup, parentIsNotebook: boolean, name: string) => void;
}
