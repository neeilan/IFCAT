import EmptyLine from './EmptyLine.jsx'

import React from 'react'
var enums = require('../enums')

export default class Question extends React.Component {
	constructor(props) {
		super(props);
		this.toggleChoiceSelection = this.toggleChoiceSelection.bind(this);
		this.state = {
			selectedChoices: [],
			givenAnswer: null
		}
	}

	componentWillReceiveProps() {
		this.setState({
			selectedChoices: [],
			givenAnswer: null
		});
	}

	render() {
		return (
			<div className="col-xs-10 text-center">
				{this.props.question}
				<EmptyLine />
        {this.getAnswerArea()}
				<br/>
				{this.getAttachmentArea()}
				<br />
				<button 
					disabled = {!!this.props.previouslyAnswered || !this.props.isDriver }
					onClick={this.props.submitCb.bind(this,   this.state.givenAnswer || this.state.selectedChoices )} 
					className="btn btn-success col-xs-10 col-xs-offset-1">
					Submit
				</button>
				<br/>
			</div>);
	}
							

	getAnswerArea() {
		switch (this.props.questionType) {
			case (enums.questionTypes.shortAnswer):
				{
					return <input 
									 type="text"
									 style={{padding: '10px'}}
									 placeholder = "Your answer"
									 onChange={(e) => this.setState( { givenAnswer : e.target.value } ) } />
				}
			case (enums.questionTypes.multipleChoice):
			case (enums.questionTypes.multiSelect):
				{
					return this.props.choices.map(
						choice =>
						<span>	
							<button 
									disabled = {!!this.props.previouslyAnswered || !this.props.isDriver}
									className = {`btn col-xs-10 col-xs-offset-1 ${ this.state.selectedChoices.indexOf(choice) > -1 ? 'btn-primary' : 'btn-default'} `}
									onClick={this.toggleChoiceSelection.bind(this, choice)}>
									{choice}
							</button>
						<br/>
					</span>);
				}
				case (enums.questionTypes.shortAnswer): {
						return (
							<span>
								<input type = "text" onChange = { (e) => this.setState({givenAnswer : e.target.value})} />
								<br/>
							</span>
						);
					}

		}
	}
							
	getAttachmentArea(){
		if (!this.props.attachments || this.props.attachments.length == 0){
			return;
		}
		var attachments = [];
		this.props.attachments.map( at => {
			switch (at.type){
					
		 }			
		})
		return attachments;
	}

	toggleChoiceSelection(choice) {
		var index = this.state.selectedChoices.indexOf(choice);
		if (index > -1) {
			this.setState({
				selectedChoices: this.state.selectedChoices.filter(ch => ch !== choice)
			})
		} else if (this.props.questionType == enums.questionTypes.multiSelect) {
			this.setState({
				selectedChoices: this.state.selectedChoices.concat([choice])
			});
		} else if (this.props.questionType == enums.questionTypes.multipleChoice) {
			this.setState({
				selectedChoices: [choice]
			});
		}
	}
}