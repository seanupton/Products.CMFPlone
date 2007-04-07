/*
 * This is the code for the tabbed forms. It assumes the following markup:
 *
 * <form class="enableFormTabbing">
 *   <fieldset id="fieldset-[unique-id]">
 *     <legend id="fieldsetlegend-[same-id-as-above]">Title</legend>
 *   </fieldset>
 * </form>
 *
 */

var ploneFormTabbing = {};

ploneFormTabbing.isFormPanel = function(node) {
    if (hasClassName(node, 'formPanel')) {
        return true;
    }
    return false;
};

ploneFormTabbing.isForm = function(node) {
    if (node.tagName == 'FORM' || node.tagName == 'form') {
        return true;
    }
    return false;
};

ploneFormTabbing.toggle = function(e) {
    if (!e) var e = window.event; // IE compatibility
    if (this.tagName.toLowerCase() == 'select') {
        var orig_id = this.value;
    } else {
        var orig_id = this.id;
    }
    var id = orig_id.replace(/^fieldsetlegend-/, "fieldset-")
    var tabs = cssQuery("form.enableFormTabbing .formTab a,"+
                        "form.enableFormTabbing option.formTab");
    for (var i=0; i<tabs.length; i++) {
        var tab = tabs[i];
        if (tab.id == this.id) {
            addClassName(tab, "selected");
        } else {
            removeClassName(tab, "selected");
        }
    }
    var panels = cssQuery("form.enableFormTabbing .formPanel");
    for (var i=0; i<panels.length; i++) {
        var panel = panels[i];
        if (panel.id == id) {
            removeClassName(panel, "hidden");
        } else {
            addClassName(panel, "hidden");
        }
    }
    var form = findContainer(panels[0], ploneFormTabbing.isForm);
    var current = cssQuery("input[name=fieldset.current]", form);
    if (current && current.length) {
        current[0].value = orig_id;
    }
    return false;
};

ploneFormTabbing._buildTabs = function(legends) {
    var threshold = 6;
    if (legends.length > threshold) {
        var tabs = document.createElement("select");
        tabs.onchange = ploneFormTabbing.toggle;
    } else {
        var tabs = document.createElement("ul");
    }
    tabs.className = "formTabs";

    for (var i=0; i<legends.length; i++) {
        var legend = legends[i];
        var parent = legend.parentNode;
        if (legends.length > threshold) {
            var tab = document.createElement("option");
        } else {
            var tab = document.createElement("li");
        }
        switch (i) {
            case 0: {
                tab.className = "formTab firstFormTab";
                break;
            }
            case (legends.length-1): {
                tab.className = "formTab lastFormTab";
                break;
            }
            default: {
                tab.className = "formTab";
                break;
            }
        }
        var text = document.createTextNode(getInnerTextFast(legend));
        if (legends.length > threshold) {
            tab.appendChild(text);
            tab.id = legend.id;
            tab.value = legend.id;
        } else {
            var a = document.createElement("a");
            a.id = legend.id;
            a.href = "#" + legend.id;
            a.onclick = ploneFormTabbing.toggle;
            var span = document.createElement("span");
            span.appendChild(text);
            a.appendChild(span);
            tab.appendChild(a);
        }
        tabs.appendChild(tab);
        parent.removeChild(legend);
    }

    return tabs;
};

ploneFormTabbing.select = function($which) {
    if (typeof $which == "string") {
        var id = $which.replace(/^fieldset-/, "fieldsetlegend-")
        $which = document.getElementById(id);
    }
    console.log($which);
    if ($which.tagName.toLowerCase() == 'a') {
        $which.onclick();
        return true;
    } else if ($which.tagName.toLowerCase() == 'option') {
        $which.parentNode.value = $which.value;
        $which.parentNode.onchange();
        return true;
    } else {
        $which.onchange();
        return true;
    }
    return false;
};

ploneFormTabbing.initializeForm = function(form) {

    var fieldsets = cssQuery("> fieldset", form);
    var legends = [];
    for (var i=0; i<fieldsets.length; i++) {
        var childnodes = fieldsets[i].childNodes;
        for (var j=0; j<childnodes.length; j++) {
            var child = childnodes[j];
            if (child.nodeType == 1 && child.tagName.toLowerCase() == 'legend') {
                legends.push(child);
            }
        }
    }

    var tabs = ploneFormTabbing._buildTabs(legends);
    form.insertBefore(tabs, form.firstChild);

    for (var i=0; i<fieldsets.length; i++) {
        var fieldset = fieldsets[i];
        addClassName(fieldset, "formPanel")
    }

    var tab_inited = false;

    var fieldswitherrors = cssQuery("div.field.error", form);
    for (var i=0; i<fieldswitherrors.length; i++) {
        var panel = findContainer(fieldswitherrors[i], ploneFormTabbing.isFormPanel);
        if (!panel) {
            continue;
        }
        var id = panel.id.replace(/^fieldset-/, "fieldsetlegend-");
        var tab = document.getElementById(id);
        if (tab) {
            addClassName(tab, "notify");
            tab_inited = ploneFormTabbing.select(tab);
        }
    }

    var active_fieldsets = cssQuery("input[name=fieldset.current]");
    for (var i=0; i<active_fieldsets.length; i++) {
        if (!tab_inited) {
            tab_inited = ploneFormTabbing.select(active_fieldsets[i].value);
        }
    }

    var tabs = cssQuery("form.enableFormTabbing .formTab a,"+
                        "form.enableFormTabbing option.formTab");
    if (!tab_inited && tabs.length > 0) {
        ploneFormTabbing.select(tabs[0]);
    }

    schema_links = document.getElementById("archetypes-schemata-links")
    if (schema_links) {
        addClassName(schema_links, "hiddenStructure");
    }

    var buttons = cssQuery("div.formControls input[name=form_previous],\
                            div.formControls input[name=form_next]");
    for (var i=0; i<buttons.length; i++) {
        addClassName(buttons[i], "hidden");
    }
};

ploneFormTabbing.initialize = function() {
    var forms = cssQuery("form.enableFormTabbing");

    for (var i=0; i<forms.length; i++) {
        ploneFormTabbing.initializeForm(forms[i]);
    }
};

registerPloneFunction(ploneFormTabbing.initialize);
