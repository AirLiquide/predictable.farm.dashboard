


var greenhouse_templates = {
	zone_selector : '\
	<div class="row zone-selector">\
		<div class="dropdown">\
			<button class="btn btn-default btn-lg dropdown-toggle" type="button" id="dropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">\
				{{zone.name}} <span class="caret"></span>\
			</button>\
			<ul class="dropdown-menu" aria-labelledby="dropdownButton">\
			{{#zones}}\
				<li{{#selected}} class="active"{{/selected}}><a href="#zone-{{id_zone}}">{{name}}</a></li>\
			{{/zones}}\
				<li class="action-button"><a href="#create-zone"><i class="glyphicon glyphicon-plus"></i> Créer une zone</a></li>\
			</ul>\
		</div>\
	</div>',

	period_selector : '\
	<div class="row row-period">\
	<div class="ten-marging-top">\
			<div class="col-md-1 col-xs-2"><button type="button" class="btn btn-default btn-block invisible-btn" id="period_navigation_previous">\
			<img src="/images/left.svg" id="period_navigation_previous" />\
			</button></div>\
			<div class="col-md-4 col-xs-8 text-center" id="period_navigation_label">{{{periodLabel}}}</div>\
			<div class="col-md-1 col-xs-2"><button type="button" class="btn btn-default btn-block invisible-btn" id="period_navigation_next">\
			<img src="/images/right.svg" id="period_navigation_next"/>\
			</button></div>\
		</div>\
		<div class="block-cal">\
			<div class="btn-group btn-group-justified" role="group">\
				<div class="btn-group" role="group">\
					<button type="button" class="btn btn-default invisible-btn-text" id="period_selector_day">Day</button>\
					<p style="display:inline-block">|</p>\
				</div>\
				<div class="btn-group" role="group">\
					<button type="button" class="btn btn-default invisible-btn-text" id="period_selector_week">Week </button>\
					<p style="display:inline-block">|</p>\
				</div>\
				<div class="btn-group" role="group">\
					<button type="button" class="btn btn-default invisible-btn-text" id="period_selector_month">Month </button>\
						<p class="last-pip" style="display:inline-block">|</p>\
				</div>\
				<div class="year-select" class="btn-group" role="group">\
					<button type="button" class="btn btn-default invisible-btn-text"  id="period_selector_year">Year</button>\
				</div>\
			</div>\
		</div>\
	</div>\
	',

	probe_selector : '\
	<div class="fix-hover-bug" id="fix-hover-bug">\
	<div class="row probe-selector">\
		<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>\
			<ul class="nav nav-pills innerWrapper" id="probe-selector">\
				{{#zone.dashboards}}\
					<li  role="presentation"class="onglet {{#selected}}active{{/selected}}" onclick="newLoadWait()">\
						<a title="{{name}}" href="#dashboard-{{id_zone}}-{{index}}" data-type="dashboard" data-id-zone="{{id_zone}}" data-dashboard_index="{{index}}" >\
							<span class="name" title="{{name}}" href="#dashboard-{{id_zone}}-{{index}}" data-type="dashboard" data-id-zone="{{id_zone}}"" data-dashboard_index="{{index}}" >{{name}}</span>\
						</a>\
					</li>\
				{{/zone.dashboards}}\
				{{#probes}}\
				<li  role="presentation" class="onglet probe-tab {{#selected}}active{{/selected}}" onclick="newLoadWait()">\
					<a title="{{name}}" href="#probe-{{id_probe}}-{{uuid}}" data-id-zone="{{id_zone}}" data-type="probe" data-id-probe="{{id_probe}}" data-uuid="{{uuid}}" >\
						<span title="{{name}}" class="name" >{{name}} </span>\
					</a>\
				</li>\
				{{/probes}}\
				<li role="presentation" class="action-button onglet" >\
					<a href="javascript:;" onclick="setup.addDashboard({{zone.id_zone}}, function(d){ window.location = \'/#dashboard-\'+d.id_zone+\'-\'+d.index; });" class="" >\
						<span class="name" style="opacity:1.0!important;">+ new</span>\
					</a>\
				</li>\
			</ul>\
			<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>\
		</div>\
	</div>\
	<script>alert("tamer")</script>',

	sensor_group : '\
	<div class="row row-chart" data-type="probe-block" data-id_probe="{{probe.id_probe}}" data-sensor_ids="{{probe.sensor_ids}}""></div>\
	<div class="row row-content gutter-20" id="sensor-list" data-id_probe="{{probe.id_probe}}" >\
		{{#sensors}}\
			<div class="sensor-block col-md-3 col-xs-6" data-id_sensor="{{id_sensor}}" style="max-width: 300px!important;">\
				<div class="value-block {{class}}">\
					<span class="value-label" title="{{label}}" style="padding-top: 12px;">{{label}}</span>\
					<span class="value-medium live-label" id="valueMedium-{{probe_uuid}}" data-live-label-id="{{probe_uuid}}:{{type}}" data-live-label-style="{{style}}" data-live-label-value="" data-device_id="{{probe_uuid}}" data-sensor_type="{{type}}">--</span>\
					<label class="switch"  onload="alert("{{sensors}}")">\
					  <input type="checkbox" class="live-label" id="checkbox-{{probe_uuid}}" onchange=" checkAlertRelay(this) " data-relay="{{sensors}}" data-id_sensor="{{id_sensor}}" data-live-label-id="{{probe_uuid}}:{{type}}" data-live-label-style="{{style}}" data-live-label-value="" data-device_id="{{probe_uuid}}" data-sensor_type="{{type}}" data-last-value="{{last_value}}" data-block_index="{{block_index}}" data-dashboard_index="{{dashboard_index}}" data-sensor_index={{sensor_index}}>\
					  <span class="slider round"></span>\
					</label>\
					<div class="block-handle"><i class="glyphicon glyphicon-sort block-handle-icon"></i></div>\
				</div>\
			</div>\
		{{/sensors}}\
	</div>',
	sensor_empty : '<div class="lead">Aucun capteur détecté</div>',

	dashboard_blocks : '{{#dashboard.blocks}}\
		<div class="dashboard-block {{type}}">\
			<div class="row-dashboard-title" data-id_zone="{{id_zone}}" data-dashboard_index="{{dashboard_index}}" data-block_index="{{block_index}}">\
				<span class="name">{{name}}</span>\
				<div class="pull-right btn-group dashboard-toggles" role="group">\
					<button type="button" class="btn {{#displayChart}}btn-primary{{/displayChart}}{{^displayChart}}btn-default{{/displayChart}}" data-toggle-type="chart">\
						<i class="glyphicon glyphicon-stats"></i>\
					</button>\
					<button type="button" class="btn {{#displaySensor}}btn-primary{{/displaySensor}}{{^displaySensor}}btn-default{{/displaySensor}}" data-toggle-type="sensor">\
						<i class="glyphicon glyphicon-list-alt"></i>\
					</button>\
				</div>\
			</div>\
			<div class="container-chart">\
			<div class="row row-chart {{^displayChart}}hidden{{/displayChart}}" data-type="dashboard-block" data-id_zone="{{id_zone}}" data-dashboard_index="{{dashboard_index}}" data-block_index="{{block_index}}" data-sensor_ids="{{sensor_ids}}"></div>\
			</div>\
			<div onload="hackUnitStyle()" class="row row-content gutter-20 {{^displaySensor}}hidden{{/displaySensor}}" data-id_zone="{{id_zone}}" data-dashboard_index="{{dashboard_index}}" data-block_index="{{block_index}}">\
				{{#sensors}}\
					<div class="sensor-block col-md-3 col-xs-6" data-id_sensor="{{id_sensor}}" style="max-width: 300px!important;">\
						<div class="value-block {{class}}">\
							<span class="value-label" title="{{label}} in {{probe_name}}">{{probe_name}}<br />{{label}}</span>\
							<span class="value-medium live-label" id="{{type}}{{probe_uuid}}" ondblclick="initRelayDoubleClick()" data-sensor_type="{{type}}" data-device_id="{{probe_uuid}}" data-live-label-id="{{probe_uuid}}:{{type}}" data-live-label-style="{{style}}">--</span>\
							<div class="block-handle"><i class="glyphicon glyphicon-sort block-handle-icon"></i></div>\
						</div>\
					</div>\
				{{/sensors}}\
				<div class="col-md-3 col-xs-6 btn-group " style="max-width: 300px!important;" >\
					<button class="btn btn-default dropdown-toggle value-block btn-add-sensor"  onclick="openDropDown({{block_index}})" style="    width: calc(100% - 30px);margin-left: 15px;">\
						<span class="value-medium plus-medium">+</span>\
					</button>\
					<ul class="dropdown-menu" id="dropdown-menu-{{block_index}}">\
						<img class="close-dropdown" src="/images/close.svg">\
						<h2 class="title-dropdown">PICK ONE ELEMENT</h2>\
						{{{dashboardBlock_addSensor}}}\
					</ul>\
					<div class="arrow-down" id="arrow-down-{{block_index}}"></div>\
					<div class="shadow-dropdown" id="shadow-dropdown" onclick="openDropDown({{block_index}})" ></div>\
				</div>\
			</div>\
		</div>\
	{{/dashboard.blocks}}',
	dashboard_empty : '<div class="row text-center">\
		<div class="lead text-center"><br />Ce tableau est vide pour l\'instant</div>\
	</div>',
	dashboard_create_block : '<div class="row text-center"><br>\
		<button class="btn btn-default" onclick="setup.addDashboardBlock({{dashboard.id_zone}}, {{dashboard.index}}, urlChangeHandler)">Add a block</button>\
	</div>',

	not_found : '<div class="row text-center">\
		<div class="lead">Contenu introuvable</div>\
	</div>'
	/*
	greenhouse : '\
	<div class="row header-greenhouse">\
		<div class="fader"></div>\
		<div class="col-md-4">\
			<h3>{{greenhouse.name}}<br /><small>{{greenhouse.location}}</small></h3>\
		</div>\
	</div>',

	probe : '\
	<div class="row header-probe">\
		<div class="col-md-4 header-probe-preview">\
			<div class="fader"></div>\
		</div>\
		<div class="col-md-8">\
			<div class="growth">\
				Croissance normale\
				<small>maturité le 02 oct</small>\
			</div>\
			<div class="row">\
				<div class="col-sm-6 value-block white">\
					<span class="value-label">Durée de vie</span>\
					<span class="value-medium">12j</span>\
				</div>\
				<div class="col-sm-6 value-block white">\
					<span class="value-label">Maturité</span>\
					<span class="value-medium">75%</span>\
				</div>\
			</div>\
		</div>\
	</div>',

	nutrient : '\
	<div class="row row-title nutrient">\
		<h3>Nutriments <small class="live-label" data-live-label-id="{{probe.id}}:misttemperature" data-live-label-style="temperature">--</small></h3>\
	</div>\
	<div class="row row-content nutrient gutter-20">\
		<div class="col-md-3 col-sm-6">\
			<div class="value-block white">\
				<span class="value-label">NPK</span>\
				<span class="value-medium live-label" data-live-label-id="{{probe.id}}:npk">--</span>\
			</div>\
		</div>\
		<div class="col-md-3 col-sm-6">\
			<div class="value-block white">\
				<span class="value-label">Ph</span>\
				<span class="value-medium live-label" data-live-label-id="{{probe.id}}:ph">--</span>\
			</div>\
		</div>\
		<div class="col-md-3 col-sm-6">\
			<div class="value-block white">\
				<span class="value-label">EC</span>\
				<span class="value-medium live-label" data-live-label-id="{{probe.id}}:ec" data-live-label-style="ec">--</span>\
			</div>\
		</div>\
		<div class="col-md-3 col-sm-6">\
			<div class="value-block white">\
				<span class="value-label">ORP</span>\
				<span class="value-medium live-label" data-live-label-id="{{probe.id}}:orp" data-live-label-style="orp">--</span>\
			</div>\
		</div>\
	</div>',

	airquality : '\
	<div class="row row-title air-quality">\
		<h3>Qualité de l\'air <small class="live-label" data-live-label-id="{{probe.id}}:airquality" data-live-label-style="air-quality">--</small> <small class="live-label" data-live-label-id="{{probe.id}}:pressure" data-live-label-style="pressure">--</small></h3>\
	</div>\
	<div class="row row-content air-quality">\
		<div class="container">\
			<div class="col-md-6">\
				<span class="title"><span class="live-label" data-live-label-id="{{probe.id}}:airquality" data-live-label-style="air-quality">--</span> qualité d\'air</span>\
			</div>\
		</div>\
		<div class="container">\
			<div class="col-md-3 col-sm-6">\
				<div class="value-block">\
					<span class="value-label">Température air</span>\
					<span class="value-medium live-label" data-live-label-id="{{probe.id}}:temperature" data-live-label-style="temperature">--</span>\
				</div>\
			</div>\
			<div class="col-md-3 col-sm-6">\
				<div class="value-block">\
					<span class="value-label">Humidité</span>\
					<span class="value-medium live-label" data-live-label-id="{{probe.id}}:humidity" data-live-label-style="percent">--</span>\
				</div>\
			</div>\
			<div class="col-md-3 col-sm-6">\
				<div class="value-block">\
					<span class="value-label">CO₂</span>\
					<span class="value-medium live-label" data-live-label-id="{{probe.id}}:co2" data-live-label-style="co2">--</span>\
				</div>\
			</div>\
			<div class="col-md-3 col-sm-6">\
				<div class="value-block">\
					<span class="value-label">Particules fines</span>\
					<span class="value-medium live-label" data-live-label-id="{{probe.id}}:dust" data-live-label-style="dust">--</span>\
				</div>\
			</div>\
		</div>\
	</div>\
	',

	light : '\
	<div class="row row-title light">\
		<h3>Lumière <small class="live-label" data-live-label-id="{{probe.id}}:lux" data-live-label-style="lux">--</small></h3>\
	</div>\
	<div class="row row-content light">\
		<canvas id="light-chart" width="600" height="240"></canvas>\
		<span id="light-chart-label" class="light-intensity live-label" data-live-label-id="{{probe.id}}:lux" data-live-label-style="lux">--</span>\
	</div>',
	*/

}
