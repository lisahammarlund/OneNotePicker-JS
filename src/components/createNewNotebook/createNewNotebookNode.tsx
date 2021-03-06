import * as React from 'react';

import { NodeRenderStrategy } from '../treeView/nodeRenderStrategy';
import { CreateNewNotebookNotStartedRenderStrategy } from './createNewNotebookNotStartedRenderStrategy';
import { CreateNewNotebookInputRenderStrategy } from './createNewNotebookInputRenderStrategy';
import { CreateNewNotebookInProgressRenderStrategy } from './createNewNotebookInProgressRenderStrategy';
import { CreateNewNotebookErrorRenderStrategy } from './createNewNotebookErrorRenderStrategy';
import { InnerGlobals } from '../../props/globalProps';
import { CreateEntityNode } from '../treeView/createEntityNode';

export interface CreateNewNotebookNodeProps extends InnerGlobals {
	level: number;
	tabbable: boolean;
}

/**
 * Presentation component that extends the 'Create' UX with notebook-specific
 * UI.
 */
export class CreateNewNotebookNode extends React.Component<CreateNewNotebookNodeProps, {}> {
	constructor(props: CreateNewNotebookNodeProps) {
		super(props);

		this.notStartedRenderStrategy = this.notStartedRenderStrategy.bind(this);
		this.inputRenderStrategy = this.inputRenderStrategy.bind(this);
		this.createErrorRenderStrategy = this.createErrorRenderStrategy.bind(this);
		this.inProgressRenderStrategy = this.inProgressRenderStrategy.bind(this);
		this.createNotebook = this.createNotebook.bind(this);
	}

	private notStartedRenderStrategy(onClick: () => void): NodeRenderStrategy {
		return new CreateNewNotebookNotStartedRenderStrategy(onClick, this.props.callbacks);
	}

	private inputRenderStrategy(
		inputValue: string,
		onEnter: () => void,
		onInputChange: (evt: React.ChangeEvent<HTMLInputElement>) => void,
		setInputRefAndFocus: (node: HTMLInputElement) => void,
		setInputToNotStarted: () => void): NodeRenderStrategy {
		return new CreateNewNotebookInputRenderStrategy(inputValue, this.props, onEnter, onInputChange, setInputRefAndFocus, setInputToNotStarted);
	}

	private createErrorRenderStrategy(
		errorMessage: string,
		inputValue: string,
		onInputChange: (evt: React.ChangeEvent<HTMLInputElement>) => void,
		setInputToNotStarted: () => void): NodeRenderStrategy {
		return new CreateNewNotebookErrorRenderStrategy(errorMessage, inputValue, onInputChange, setInputToNotStarted);
	}

	private inProgressRenderStrategy(inputValue: string): NodeRenderStrategy {
		return new CreateNewNotebookInProgressRenderStrategy(inputValue);
	}

	private createNotebook(name: string): Promise<void> {
		return this.props.oneNoteDataProvider!.createNotebook(name).then((notebook) => {
			return this.props.callbacks.onNotebookCreated!(notebook);
		});
	}

	render() {
		return (
			<CreateEntityNode
				{...this.props}
				notStartedRenderStrategy={this.notStartedRenderStrategy}
				inputRenderStrategy={this.inputRenderStrategy}
				createErrorRenderStrategy={this.createErrorRenderStrategy}
				inProgressRenderStrategy={this.inProgressRenderStrategy}
				createEntity={this.props.callbacks.onNotebookCreated ? this.createNotebook : undefined}>
			</CreateEntityNode>
		);
	}
}
