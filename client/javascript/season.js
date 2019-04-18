/**
 * Things used on season-related pages
 */

if (undefined === ld2l) {
	var ld2l = {};
}

ld2l.expandedSignup = null;

ld2l.season = {
	id : 0,
	admin : false,
	current_row : ''
};

$(window).load(function() {
	var table = $('#draft-list')[0];
	ld2l.season.id = parseInt(table.dataset.season);
	ld2l.season.admin = table.dataset.admin == 'true';
});

/**
 * Create the detailed signup info below the current row
 */
ld2l.signupExpand = function(row) {
	if (ld2l.expandedSignup) {
		ld2l.expandedSignup.remove();

		// Second click on the same row collapses
		if (row.dataset.steamid == ld2l.season.current_row) {
			ld2l.season.current_row = '';
			return;
		}
	}

	ld2l.season.current_row = row.dataset.steamid;

	var solo = parseInt(row.dataset.soloMmr);
	var party = parseInt(row.dataset.partyMmr);
	var mmr = Math.max(solo, party);

	var data = {
		admin : ld2l.season.admin,
		season : ld2l.season.id,
		linear : parseInt(row.dataset.linear),
		team : parseInt(row.dataset.team),
		captain : row.dataset.captain == '1' ? 'Y' : (row.dataset.captain == '2' ? 'M' : 'N'),
		createTeam : (parseInt(row.dataset.team) == 0),
		standin : (row.dataset.validstandin == '1'),
		draftable : (row.dataset.draftable == '1'),
		vouched : (row.dataset.vouched == '1'),
		hide : (row.dataset.hidden == '0'),
		solo_mmr : row.dataset.soloMmr,
		party_mmr : row.dataset.partyMmr,
		mmr : mmr,
		mmr_screenshot : row.dataset.mmrScreenshot,
		steamid : row.dataset.steamid
	};
	console.log(data);

	dust.render('expanded_signup', data, function(err, out) {
		$(row).after(out);
		ld2l.expandedSignup = $('#expanded_signup');
	});
}

function createTeam(steamid) {
	console.log('Creating new team in season '+ld2l.season.id+' run by '+steamid);
	var row = $('tr[data-steamid="'+steamid+'"]')[0];

	$.ajax({
		url : '/seasons/new_team',
		data : {
			season : ld2l.season.id,
			steamid : steamid
		},
		method : 'POST',
		dataType : 'json'
	}).done(function(data, status, xhr) {
		console.log(data);
		console.log(status);
		ld2l.signupExpand(row);
	});
}

function vouch(steamid) {
	$.ajax({
		url : '/profile/'+steamid+'/vouch',
		method : 'GET',
		accepts : 'application/json'
	}).done(function(data, status, xhr) {
		if (data.success) {
			var row = $('tr[data-steamid="'+steamid+'"]')[0];
			row.dataset.vouched = "1";
			ld2l.signupExpand(row);
		}
	});
}

function hideSignup(steamid, hide) {
	console.log('Setting hidden to '+hide+' for '+steamid);
	ld2l.$.ajax('/seasons/hide_signup', {
		steamid : steamid,
		hide : hide,
		season : ld2l.season.id
	}).then(function(data) {
		var row = document.querySelector('tr[data-steamid="'+steamid+'"]');

		if (hide) {
			row.dataset.hidden = "1";
		}
		else {
			row.dataset.hidden = "0";
		}
		ld2l.signupExpand(row);
	});
}

function setDraftable(steamid, draftable) {
	console.log('Setting draftable to '+draftable+' for player '+steamid+' in season '+ld2l.season.id);
	$.ajax({
		url : '/draft/toggle',
		data : {
			steamid : steamid,
			draftable : draftable,
			season : ld2l.season.id
		},
		method : 'POST',
		dataType : 'json'
	}).done(function(data, status, xhr) {
		var row = $('tr[data-steamid="'+steamid+'"]')[0];
		if (draftable) {
			row.dataset.draftable = "1";
		}
		else {
			row.dataset.draftable = "0";
		}
		ld2l.signupExpand(row);
	});
}

function setStandin(steamid, free) {
	console.log('Setting standin to '+free+' for player '+steamid+' in season '+ld2l.season.id);
	$.ajax({
		url : '/standin/toggle',
		data : {
			steamid : steamid,
			standin : free,
			season : ld2l.season.id
		},
		method : 'POST',
		dataType : 'json'
	}).done(function(data, status, xhr) {
		var row = $('tr[data-steamid="'+steamid+'"]')[0];
		if (free) {
			row.dataset.validstandin = "1";
		}
		else
		{
			row.dataset.validstandin = "0";
		}
		ld2l.signupExpand(row);
	});
}

function editSignup(steamid) {
	window.location.href = '/seasons/signup/'+ld2l.season.id+'/'+steamid;
}
