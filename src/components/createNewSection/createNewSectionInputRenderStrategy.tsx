import * as React from 'react';

import { NodeRenderStrategy } from '../treeView/nodeRenderStrategy';
import { ErrorInfoIconSvg } from '../icons/errorInfoIcon.svg';
import { Strings } from '../../strings';
import { NameValidator } from '../../nameValidator';
import { CreateNewSectionCommonProperties } from './createNewSectionCommonProperties';
import { CreateNewSectionRowTemplate } from './createNewSectionRowTemplate';

export class CreateNewSectionInputRenderStrategy extends CreateNewSectionCommonProperties implements NodeRenderStrategy {
	onClickBinded = () => { };

	constructor(
		parentId: string,
		private notebookNameInputValue: string,
		private onEnterBinded: (event) => void,
		private onChangeBinded: (event: React.ChangeEvent<HTMLInputElement>) => void,
		private inputRefBinded: (node: HTMLInputElement) => void) {
		super(parentId);
	}

	element(): JSX.Element {
		// TODO (machiam) error info should have a popover as per redlines
		return (
			<CreateNewSectionRowTemplate>
				<div className='picker-label'>
					<input
						className='create-input'
						ref={this.inputRefBinded}
						type='text'
						placeholder={Strings.get('Input.CreateSectionPlaceholder')}
						autoComplete='off'
						value={this.notebookNameInputValue}
						onKeyPress={this.onKeyPress.bind(this)}
						onChange={this.onChangeBinded} />
				</div>
				<div className='error-info-icon' style={this.showError() ? { } : { visibility: 'hidden' }}>
					<ErrorInfoIconSvg />
				</div>
			</CreateNewSectionRowTemplate>
		);
	}

	private showError(): boolean {
		return !!NameValidator.validateNotebookName(this.notebookNameInputValue);
	}

	private onKeyPress(event): void {
		if (event.key === 'Enter') {
			this.onEnterBinded(event);
		}
	}
}
