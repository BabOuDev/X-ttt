import React, { Component} from 'react'
import { Link } from 'react-router'

import SetName from './SetName'
import SetGameType from './SetGameType'

import GameMain from './GameMain'
import GameMain3D from './GameMain3D'

export default class Ttt extends Component {

	constructor (props) {
		super(props)

		this.state = {
			game_step: this.set_game_step()
		}
	}

//	------------------------	------------------------	------------------------

	render () {

		const {game_step, game_type, game_dimension, difficulty} = this.state

		console.log(game_step)

		return (
			<section id='TTT_game'>
				<div id='page-container'>
					{game_step == 'set_name' && <SetName
														onSetName={this.saveUserName.bind(this)}
												/>}

					{game_step != 'set_name' &&
						<div>
							<h2>Welcome, {app.settings.curr_user.name}</h2>
						</div>
					}

					{game_step == 'set_game_type' && <SetGameType
														onSetType={this.saveGameType.bind(this)}
													/>}
					{game_step == 'start_game' && game_dimension == '2d' && <GameMain
														game_type={game_type}
														difficulty={difficulty}
														onEndGame={this.gameEnd.bind(this)}
													/>}
					{game_step == 'start_game' && game_dimension == '3d' && <GameMain3D
														game_type={game_type}
														difficulty={difficulty}
														onEndGame={this.gameEnd.bind(this)}
													/>}

				</div>
			</section>
		)
	}

//	------------------------	------------------------	------------------------

	saveUserName (n) {
		app.settings.curr_user = {}
		app.settings.curr_user.name = n

		this.upd_game_step()
	}

//	------------------------	------------------------	------------------------

	saveGameType (t, d, difficulty) {
		this.state.game_type = t
		this.state.game_dimension = d
		this.state.difficulty = difficulty || 'easy'

		this.upd_game_step()
	}

//	------------------------	------------------------	------------------------

	gameEnd (t) {
		this.state.game_type = null
		this.state.game_dimension = null

		this.upd_game_step()
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	upd_game_step () {

		this.setState({
			game_step: this.set_game_step()
		})
	}

//	------------------------	------------------------	------------------------

	set_game_step () {

		if (!app.settings.curr_user || !app.settings.curr_user.name)
			return 'set_name'
		else if (!this.state.game_type)
			return 'set_game_type'
		else
			return 'start_game'
	}

}

//	------------------------	------------------------	------------------------

Ttt.propTypes = {
	params: React.PropTypes.any
}

Ttt.contextTypes = {
  router: React.PropTypes.object.isRequired
}