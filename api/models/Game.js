/**
 * Game
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
	playerNumber:'integer',
	round:'integer',
	cycle:'integer',
	players:'json',
	currentTides:'array',
	remainingTides:'array',
	alive:'integer',
	numOfReady:'integer',
	roundCards:'array',
	playerPos:'array'
    
  }

};
