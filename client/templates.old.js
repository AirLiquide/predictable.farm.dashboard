var greenhouse_templates = {
	greenhouse_selector : '\
	<div class="row greenhouse-selector">\
		<div class="dropdown">\
			<button class="btn btn-default btn-lg dropdown-toggle" type="button" id="dropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">\
				{{greenhouse.name}} <span class="caret"></span>\
			</button>\
			<ul class="dropdown-menu" aria-labelledby="dropdownButton">\
			{{#greenhouses}}\
				<li{{#selected}} class="active"{{/selected}}><a href="#greenhouse-{{id_zone}}">{{name}}</a></li>\
			{{/greenhouses}}\
			</ul>\
		</div>\
	</div>',

	probe_selector : '\
	<div class="row probe-selector">\
		<ul class="nav nav-pills">\
			<li role="presentation"{{#greenhouse.selected}} class="active"{{/greenhouse.selected}}>\
				<a href="#greenhouse-{{greenhouse.id}}">Global</a>\
			</li>\
			{{#probes}}\
			<li role="presentation"{{#selected}} class="active"{{/selected}}>\
				<a href="#probe-{{id}}">{{name}}</a>\
			</li>\
			{{/probes}}\
		</ul>\
	</div>',

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
	</div>'
}