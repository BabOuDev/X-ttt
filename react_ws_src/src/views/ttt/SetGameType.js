import React, {Component} from 'react'

export default class SetGameType extends Component {

	constructor (props) {
		super(props)

		this.state = {
			showingDifficulty: false,
			pendingDimension: null
		}
	}

//	------------------------	------------------------	------------------------

	render () {
		const { showingDifficulty, pendingDimension } = this.state

		if (showingDifficulty) {
			return (
				<div id='SetGameType'>
					<h1>Choose difficulty</h1>
					<p style={{color: '#aaa', marginBottom: '20px'}}>Select AI difficulty for {pendingDimension === '2d' ? '2D' : '3D'} mode</p>

					<button type='submit' onClick={() => this.selectDifficulty('easy')} className='button long' style={{background: '#4a9f4a'}}>
						<span>Easy (Random Moves) <span className='fa fa-smile-o'></span></span>
					</button>
					<br /><br />

					<button type='submit' onClick={() => this.selectDifficulty('medium')} className='button long' style={{background: '#f39c12'}}>
						<span>Medium (Smart) <span className='fa fa-meh-o'></span></span>
					</button>
					<br /><br />

					<button type='submit' onClick={() => this.selectDifficulty('hard')} className='button long' style={{background: '#e74c3c'}}>
						<span>Hard (Unbeatable) <span className='fa fa-frown-o'></span></span>
					</button>
					<br /><br />

					<button type='submit' onClick={() => this.setState({showingDifficulty: false, pendingDimension: null})} className='button'>
						<span><span className='fa fa-arrow-left'></span> Back</span>
					</button>
				</div>
			)
		}

		return (
			<div id='SetGameType'>

				<h1>Choose game mode</h1>

				<h2>2D Classic Mode</h2>
				<button type='submit' onClick={this.selType2DLive.bind(this)} className='button long'><span>2D Live (vs Player) <span className='fa fa-caret-right'></span></span></button>

				&nbsp;&nbsp;&nbsp;&nbsp;

				<button type='submit' onClick={this.selType2DComp.bind(this)} className='button long'><span>2D vs Computer <span className='fa fa-caret-right'></span></span></button>

				<br /><br />

				<h2>3D Cube Mode</h2>
				<button type='submit' onClick={this.selType3DLive.bind(this)} className='button long'><span>3D Live (vs Player) <span className='fa fa-caret-right'></span></span></button>

				&nbsp;&nbsp;&nbsp;&nbsp;

				<button type='submit' onClick={this.selType3DComp.bind(this)} className='button long'><span>3D vs Computer <span className='fa fa-caret-right'></span></span></button>

			</div>
		)
	}

//	------------------------	------------------------	------------------------

	selType2DLive (e) {
		this.props.onSetType('live', '2d', 'easy')
	}

//	------------------------	------------------------	------------------------

	selType2DComp (e) {
		this.setState({
			showingDifficulty: true,
			pendingDimension: '2d'
		})
	}

//	------------------------	------------------------	------------------------

	selType3DLive (e) {
		this.props.onSetType('live', '3d', 'easy')
	}

//	------------------------	------------------------	------------------------

	selType3DComp (e) {
		this.setState({
			showingDifficulty: true,
			pendingDimension: '3d'
		})
	}

//	------------------------	------------------------	------------------------

	selectDifficulty (difficulty) {
		this.props.onSetType('comp', this.state.pendingDimension, difficulty)
	}

}
