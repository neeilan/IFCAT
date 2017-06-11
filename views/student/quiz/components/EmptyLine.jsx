// import React from 'react'
var enums = require('../enums')

export default class EmptyLine extends React.Component {
	constructor(props){
		super(props);
	}
	
	render(){
		return (
			<span>
				<br/>
				<br/>
			</span>
		);
	}
}
