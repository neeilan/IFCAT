import React from 'react'
import EmptyLine from './EmptyLine.jsx'

export default class ScoreBar extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {

		

		var buttons = this.props.questions.map( (q, i) =>
			{
			var response = this.props.responses[q._id];
			var btnClass = (response && response.correct) ? 'btn-success' : '';

			return (<span key = {q.id + 'scbtn' + i}>
				<button 
					className = {`btn btn-default ${ (this.props.selectedQuestion && 
												     (this.props.selectedQuestion._id === q._id)) ? 'btn-primary' : btnClass} `}
					onClick={this.props.selectQuestionCb.bind(this, q)}
					> 
							{q.number} 
				</button>
            </span>);
			});

		return (
			<div className="col-xs-10 col-xs-offset-1 col-md-2">
				 {buttons}
				 <EmptyLine/>
			</div>);
	}
}