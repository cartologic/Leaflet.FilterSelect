L.FilterSelect = L.Control.extend({
    options: {
        position: 'topright',
        title: 'Select',
        exclude: [],
        include: [],
    },
    onAdd: function (map) {
        this.div = L.DomUtil.create('div');
        this.select = L.DomUtil.create('select', 'leaflet-filterselect leaflet-bar', this.div);
        // this.select.size = 8;
        this.select.parentControl = this;
        this.map = map;
        let content = '';

        if (this.options.title.length > 0) {
            content += '<option>' + this.options.title + '</option>';
        }

        var features = (Array.isArray(this.options.include) && this.options.include.length > 0) ? this.options.include : this.options.features;

        for (i in features) {
            if (this.options.exclude.indexOf(features[i]) == -1) {
                content += '<option value="' + i + '">' + features[i].properties[this.options.displayField] + '</option>';
            }
        }

        this.select.innerHTML = content;

        this.select.onmousedown = L.DomEvent.stopPropagation;
        this.select.onchange = this._onChange

        return this.div;
    },

    addTo: function (map) {
        if(this.options.container) {
            this.div = this.onAdd(map);
            this._wrapper = L.DomUtil.get(this.options.container);
            this._wrapper.style.position = 'relative';
            this._wrapper.appendChild(this.div);
        }
        else
            L.Control.prototype.addTo.call(this, map);
        return this;
    },

    _onChange: function (e) {
    	const selectedItem = this.options[this.selectedIndex].value;
        e.feature = this.parentControl.options.features[selectedItem];
        if (e.feature === undefined) { //No action when the first item  is selected
            // This is a hack and should be replaced by a solid solution
            this.parentControl.map.setView(config.start.center, config.start.zoom);
            setTimeout(() => {
                let condition = window.opportunitiesMapConfig.filterQuery;
                this.parentControl.options.targetLayer.setWhere(condition); // clear filters
            }, 500);

			if (this.previousFeature !== null)
                this.parentControl.map.removeLayer(this.previousFeature);
            return;
        }
        let condition = "" + this.parentControl.options.targetFilterField + "='";
        condition += e.feature.properties[this.parentControl.options.sourceFilterField] + "'";
        this.parentControl.options.targetLayer.setWhere(condition);
        const feature = L.geoJson(e.feature);
        if (this.previousFeature != null) {
            this.parentControl.map.removeLayer(this.previousFeature);
        }
        this.previousFeature = feature;

        this.parentControl.map.addLayer(feature);
        this.parentControl.map.fitBounds(feature.getBounds());
    }
});

L.filterSelect = function (id, options) {
    return new L.FilterSelect(id, options);
};




