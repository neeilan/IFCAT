import React from 'react'

export default class ScoreBar extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var buttons = this.props.questions.map(q =>
			<span>
				<button 
					className = {`btn btn-default ${ (this.props.selectedQuestion && 
																					 (this.props.selectedQuestion.id == q.id)) ? 'btn-primary' : ''} `}
					onClick={this.props.selectQuestionCb.bind(this, q)}> 
							{q.number} 
				</button>
				<br/>																	 
            </span>);

		return (
			<div className="col-xs-2">
				 {buttons}
			</div>);
	}
}