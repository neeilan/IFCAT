import React from 'react'

export default class PreQuiz extends React.Component {
	constructor(props) {
		super(props);
		this.strings = {
			driverBtnClass: 'btn col-md-4 col-sm-10 col-xs-12 col-md-offset-4 col-sm-offset-1'
		}
	}
	render() {
		return (
			<div className="row text-center">
                This quiz requires a member of your group to serve as the driver, who will submit answers.
                <br />
                <button 
                    onClick={this.props.setDriverCb.bind(this, true)} 
                    className= {`${this.strings.driverBtnClass} btn-primary`}> 
                        I will be driver
                </button>
                <br/>
                <button 
                    onClick={this.props.setDriverCb.bind(this, false)} 
                    className= {`${this.strings.driverBtnClass} btn-danger`}>                    
                        I will not be the driver
                </button>
				<br/>
            </div>
		);
	}
}