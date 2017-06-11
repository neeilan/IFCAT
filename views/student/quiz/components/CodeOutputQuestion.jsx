// import React from 'react'
var enums = require('../enums')

export default class CodeOutputQuestion extends React.Component 
{
	constructor(props)
    {
		super(props);
        this.checkUserInput = this.checkUserInput.bind(this); // bind "this" context
        this.userInputCb = this.userInputCb.bind(this); 
        this.getCheckAnswerButton = this.getCheckAnswerButton.bind(this);
        this.userInputsShouldRender= this.userInputsShouldRender.bind(this);
        this.state = {
            correctOutputLines : 0,
            enteredAnswer : '',
            output : []
        }
	}
    
	render()
    {              
		return (
			<div style={{width : '100%', textAlign: 'left'}} >
                <pre className="prettyprint linenums" style={{border:'none'}}>
                    {this.props.question.code}
                </pre>
                <pre>
                    {this.getOutputLines()}
                    {this.getInputBox()}
                </pre>
                {this.getCheckAnswerButton()}
			</div>
		);
	}    
    
    checkUserInput()
    {
        this.props.checkInputCb(this.state.output.concat([this.state.enteredAnswer]));
    }
    
    userInputCb(e)
    {
        this.setState({ enteredAnswer : e.target.value })
    }
    
    userInputsShouldRender()
    {
        return true;
    //  return (this.state.correctOutputLines < this.props.question.output.length)
    }
    
    getCheckAnswerButton()
    {
        if (!this.userInputsShouldRender())
            return null;
        return (
            <button
                className="btn btn-success"
                style={{width:'100%'}}
                onClick={this.checkUserInput}>
                Check
            </button>);
    }
    
    getInputBox()
    {
         if (!this.userInputsShouldRender())
            return null;  
        
        return (
            <input 
                value = {this.state.enteredAnswer}
                onChange = {this.userInputCb}
                placeholder = "Enter the next line of output here"
                type = "text"
                style = {
                    {
                        width : '100%',
                        border : 'none',
                        padding : '5px',
                        background : 'none'
                    }
                }
            />);
    }
    
    getOutputLines()
    {
        var outputLines = [];
                                                              
        // for (let i = 0; i < this.state.correctOutputLines; i++)
        // {
        //         outputLines.push(<span> {this.props.question.output[i]} <br/></span>);
        // }
        
        return outputLines;
    }
}