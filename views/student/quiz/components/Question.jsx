import EmptyLine from './EmptyLine.jsx'
import CodeOutputQuestion from './CodeOutputQuestion.jsx'

import React from 'react'
var enums = require('../enums');

export default class Question extends React.Component {
	constructor(props) {
		super(props);
		this.toggleChoiceSelection = this.toggleChoiceSelection.bind(this);
		this.submitAnswer = this.submitAnswer.bind(this);

		this.state = {
			selectedChoices: [],
			givenAnswer: null,
			showAttachments : false
		}
	}

	getSubmitBtn() {
		var btnText = 'SUBMIT';
		if (!this.props.isDriver)
			btnText = 'NOT DRIVER'
		if (this.props.response && this.props.response.correct)
			btnText = enums.messages.correctlyAnswered;

		var submitBtn;
		if (this.props.questionType == enums.questionTypes.codeTracing) {
			submitBtn = null;
		} else {
			submitBtn = <button 
						disabled = { !this.props.isDriver || (this.props.response && this.props.response.correct) }
						onClick={this.submitAnswer} 
						className="btn btn-success col-xs-10 col-xs-offset-1">
						{btnText}
					</button>;
		}
		return submitBtn;
	}

	render() {
	
		return (
			<div className="col-xs-12 col-md-9 text-center">
				<br/>
				{this.props.questionRef.question}
				<EmptyLine/>
				{this.getAttachmentBtn()}
				<br/>
				{this.getAttachments()}
				<br/>
        		{this.getAnswerArea()}
				<br />
				{this.getSubmitBtn()}
				<br/>
			</div>);
	}

	submitAnswer() {
		this.props.submitCb(this.state.givenAnswer || this.state.selectedChoices);
	}

	getAttachmentBtn() {
		if ((this.props.questionRef.files && this.props.questionRef.files.length > 0) || (this.props.questionRef.links && this.props.questionRef.links.length > 0))
			return (<span className="btn btn-default" onClick={()=>this.setState({showAttachments : !this.state.showAttachments})}> 
				<i className="fa fa-paperclip" aria-hidden="true"></i>
				{(this.state.showAttachments ? ' Hide' : ' Show') + ' attachments'}
				</span>);
	}

	getAttachments() {
		if (!this.state.showAttachments)
			return null;
		var attachments = [];
		var url = window.location.href;
		if (this.props.questionRef.files)
		{
			this.props.questionRef.files.forEach(function(file){
				var courseId = url.slice(url.indexOf('/courses/') + 9, url.indexOf('/quizzes'));
				var fileUrl = '/upl/' + courseId + '/' + file.name;
				if (file.type.includes('image')) {
					attachments.push(
						<div>
							<img className='attachedImg' src={fileUrl} /><br/>
							<a target='_blank' href={fileUrl}>Direct link</a><br/>
						</div>
					);
				} else if (file.type.includes('audio')){
					attachments.push(
						<div>
							<audio controls>
								<source src={fileUrl} type={file.type}/>
							</audio>
							<br/>
							<a target='_blank' href={fileUrl}>Direct link</a><br/>
						</div>
					);
				} 
			})
		} 
		if (this.props.questionRef.links) {
			this.props.questionRef.links.forEach(function(link){
				attachments.push(<div><br/><a target='_blank' href={link}>{link}</a><br/></div>);
			})
		}
		return attachments;
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
					return this.props.questionRef.choices.map(
						(choice, i) =>
						<span key = {this.props.questionRef._id + 'ch'+ i}>	
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
			case (enums.questionTypes.codeTracing) : {
				return <CodeOutputQuestion 
					question={this.props.questionRef}
					response={this.props.response} 
					checkInputCb={this.props.submitCb}
					isDriver={this.props.isDriver}/>;
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