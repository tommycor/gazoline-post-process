import Scene from './components/Scene'

window.onload = function() {

	var items = document.querySelectorAll('.js-gazoline');
	var exp = new Array();

	if( items == void 0 || items.length == 0 ) { return; }

	for( let i = 0 ; i < items.length ; i++ ) {
		exp.push( new Scene( items[i] ) );
	}


}
