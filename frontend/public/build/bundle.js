
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.38.2 */

    const { Error: Error_1, Object: Object_1, console: console_1$2 } = globals;

    // (251:0) {:else}
    function create_else_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		const newState = { ...history.state };
    		delete newState["__svelte_spa_router_scrollX"];
    		delete newState["__svelte_spa_router_scrollY"];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute("href");

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == "/") {
    		// Add # to the href attribute
    		href = "#" + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != "#/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	node.setAttribute("href", href);

    	node.addEventListener("click", event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute("href"));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == "string") {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener("popstate", popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == "object" && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener("popstate", popStateChanged);
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("popStateChanged" in $$props) popStateChanged = $$props.popStateChanged;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Product.svelte generated by Svelte v3.38.2 */
    const file$9 = "src\\components\\Product.svelte";

    // (25:0) {:else }
    function create_else_block$1(ctx) {
    	let div4;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t2;
    	let div2;
    	let t4;
    	let div3;
    	let t6;
    	let button;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "superp gun for killing the enemy";
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "stock: 34";
    			t4 = space();
    			div3 = element("div");
    			div3.textContent = "$80000.99";
    			t6 = space();
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(img, "class", "product-image");
    			if (img.src !== (img_src_value = "/static/images/gun.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Product");
    			add_location(img, file$9, 28, 16, 992);
    			attr_dev(a, "href", "#/products/id");
    			add_location(a, file$9, 27, 12, 950);
    			attr_dev(div0, "class", "product-image-wrapper");
    			add_location(div0, file$9, 26, 8, 901);
    			attr_dev(div1, "class", "product-name");
    			add_location(div1, file$9, 31, 8, 1106);
    			attr_dev(div2, "class", "products-in-stock bold");
    			add_location(div2, file$9, 32, 8, 1180);
    			attr_dev(div3, "class", "product-price bold");
    			add_location(div3, file$9, 33, 8, 1241);
    			attr_dev(path, "d", "M504.717 320H211.572l6.545 32h268.418c15.401 0 26.816 14.301 23.403 29.319l-5.517 24.276C523.112 414.668 536 433.828 536 456c0 31.202-25.519 56.444-56.824 55.994-29.823-.429-54.35-24.631-55.155-54.447-.44-16.287 6.085-31.049 16.803-41.548H231.176C241.553 426.165 248 440.326 248 456c0 31.813-26.528 57.431-58.67 55.938-28.54-1.325-51.751-24.385-53.251-52.917-1.158-22.034 10.436-41.455 28.051-51.586L93.883 64H24C10.745 64 0 53.255 0 40V24C0 10.745 10.745 0 24 0h102.529c11.401 0 21.228 8.021 23.513 19.19L159.208 64H551.99c15.401 0 26.816 14.301 23.403 29.319l-47.273 208C525.637 312.246 515.923 320 504.717 320zM408 168h-48v-40c0-8.837-7.163-16-16-16h-16c-8.837 0-16 7.163-16 16v40h-48c-8.837 0-16 7.163-16 16v16c0 8.837 7.163 16 16 16h48v40c0 8.837 7.163 16 16 16h16c8.837 0 16-7.163 16-16v-40h48c8.837 0 16-7.163 16-16v-16c0-8.837-7.163-16-16-16z");
    			add_location(path, file$9, 35, 74, 1407);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 576 512");
    			add_location(svg, file$9, 35, 12, 1345);
    			attr_dev(button, "class", "add-to-cart-icon");
    			add_location(button, file$9, 34, 8, 1298);
    			attr_dev(div4, "class", "product");
    			add_location(div4, file$9, 25, 4, 870);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div4, t6);
    			append_dev(div4, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(25:0) {:else }",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if variant == "CartProduct"}
    function create_if_block$1(ctx) {
    	let div4;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t2;
    	let div3;
    	let div1;
    	let t3;
    	let t4;
    	let t5;
    	let input;
    	let t6;
    	let hr;
    	let t7;
    	let div2;
    	let t8;
    	let t9;
    	let t10;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "this is a superb Gun";
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t3 = text("Price: $");
    			t4 = text(/*price*/ ctx[3]);
    			t5 = space();
    			input = element("input");
    			t6 = space();
    			hr = element("hr");
    			t7 = space();
    			div2 = element("div");
    			t8 = text("Total: $");
    			t9 = text(/*total*/ ctx[2]);
    			t10 = space();
    			button = element("button");
    			button.textContent = "x";
    			if (img.src !== (img_src_value = "/static/images/gun.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "cart-product-image");
    			attr_dev(img, "alt", "product");
    			add_location(img, file$9, 12, 8, 296);
    			attr_dev(div0, "class", "product-name bold");
    			add_location(div0, file$9, 13, 8, 381);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "name", "qantity");
    			attr_dev(input, "id", "product-quantity");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", "10");
    			add_location(input, file$9, 17, 16, 563);
    			attr_dev(div1, "class", "product-price bold");
    			add_location(div1, file$9, 15, 12, 480);
    			add_location(hr, file$9, 19, 12, 696);
    			attr_dev(div2, "class", "product-total bold");
    			add_location(div2, file$9, 20, 12, 715);
    			attr_dev(div3, "class", "span");
    			add_location(div3, file$9, 14, 8, 448);
    			attr_dev(button, "class", "remove-from-cart bold");
    			add_location(button, file$9, 22, 8, 794);
    			attr_dev(div4, "class", "cart-product");
    			add_location(div4, file$9, 11, 4, 260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, img);
    			append_dev(div4, t0);
    			append_dev(div4, div0);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, input);
    			set_input_value(input, /*quantity*/ ctx[1]);
    			append_dev(div3, t6);
    			append_dev(div3, hr);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, t8);
    			append_dev(div2, t9);
    			append_dev(div4, t10);
    			append_dev(div4, button);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*quantity*/ 2 && to_number(input.value) !== /*quantity*/ ctx[1]) {
    				set_input_value(input, /*quantity*/ ctx[1]);
    			}

    			if (dirty & /*total*/ 4) set_data_dev(t9, /*total*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:0) {#if variant == \\\"CartProduct\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*variant*/ ctx[0] == "CartProduct") return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Product", slots, []);
    	let { variant = "Product" } = $$props;
    	let price = 10;
    	let quantity = 1;
    	let total;
    	const writable_props = ["variant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Product> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		quantity = to_number(this.value);
    		$$invalidate(1, quantity);
    	}

    	$$self.$$set = $$props => {
    		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		beforeUpdate,
    		variant,
    		price,
    		quantity,
    		total
    	});

    	$$self.$inject_state = $$props => {
    		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
    		if ("price" in $$props) $$invalidate(3, price = $$props.price);
    		if ("quantity" in $$props) $$invalidate(1, quantity = $$props.quantity);
    		if ("total" in $$props) $$invalidate(2, total = $$props.total);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*quantity*/ 2) {
    			$$invalidate(2, total = price * quantity);
    		}
    	};

    	return [variant, quantity, total, price, input_input_handler];
    }

    class Product extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { variant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Product",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get variant() {
    		throw new Error("<Product>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Product>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Products.svelte generated by Svelte v3.38.2 */

    const { console: console_1$1 } = globals;
    const file$8 = "src\\components\\Products.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let product0;
    	let t0;
    	let product1;
    	let t1;
    	let product2;
    	let t2;
    	let product3;
    	let t3;
    	let product4;
    	let t4;
    	let product5;
    	let current;
    	product0 = new Product({ $$inline: true });
    	product1 = new Product({ $$inline: true });
    	product2 = new Product({ $$inline: true });
    	product3 = new Product({ $$inline: true });
    	product4 = new Product({ $$inline: true });
    	product5 = new Product({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(product0.$$.fragment);
    			t0 = space();
    			create_component(product1.$$.fragment);
    			t1 = space();
    			create_component(product2.$$.fragment);
    			t2 = space();
    			create_component(product3.$$.fragment);
    			t3 = space();
    			create_component(product4.$$.fragment);
    			t4 = space();
    			create_component(product5.$$.fragment);
    			attr_dev(div, "class", "products");
    			add_location(div, file$8, 6, 0, 171);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(product0, div, null);
    			append_dev(div, t0);
    			mount_component(product1, div, null);
    			append_dev(div, t1);
    			mount_component(product2, div, null);
    			append_dev(div, t2);
    			mount_component(product3, div, null);
    			append_dev(div, t3);
    			mount_component(product4, div, null);
    			append_dev(div, t4);
    			mount_component(product5, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(product0.$$.fragment, local);
    			transition_in(product1.$$.fragment, local);
    			transition_in(product2.$$.fragment, local);
    			transition_in(product3.$$.fragment, local);
    			transition_in(product4.$$.fragment, local);
    			transition_in(product5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(product0.$$.fragment, local);
    			transition_out(product1.$$.fragment, local);
    			transition_out(product2.$$.fragment, local);
    			transition_out(product3.$$.fragment, local);
    			transition_out(product4.$$.fragment, local);
    			transition_out(product5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(product0);
    			destroy_component(product1);
    			destroy_component(product2);
    			destroy_component(product3);
    			destroy_component(product4);
    			destroy_component(product5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Products", slots, []);
    	fetch("http://127.0.0.1:8000/api/products/categories/men/").then(res => console.log(res));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Products> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Product });
    	return [];
    }

    class Products extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Products",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\Cart.svelte generated by Svelte v3.38.2 */
    const file$7 = "src\\components\\Cart.svelte";

    function create_fragment$7(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let product0;
    	let t2;
    	let product1;
    	let t3;
    	let product2;
    	let t4;
    	let button;
    	let current;

    	product0 = new Product({
    			props: { variant: "CartProduct" },
    			$$inline: true
    		});

    	product1 = new Product({
    			props: { variant: "CartProduct" },
    			$$inline: true
    		});

    	product2 = new Product({
    			props: { variant: "CartProduct" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Cart";
    			t1 = space();
    			div0 = element("div");
    			create_component(product0.$$.fragment);
    			t2 = space();
    			create_component(product1.$$.fragment);
    			t3 = space();
    			create_component(product2.$$.fragment);
    			t4 = space();
    			button = element("button");
    			button.textContent = "Check Out";
    			attr_dev(h1, "class", "svelte-15fc3h1");
    			add_location(h1, file$7, 6, 4, 156);
    			attr_dev(div0, "class", "products-in-cart");
    			add_location(div0, file$7, 7, 4, 175);
    			attr_dev(button, "class", "svelte-15fc3h1");
    			add_location(button, file$7, 12, 4, 349);
    			attr_dev(div1, "class", "cart");
    			add_location(div1, file$7, 5, 0, 132);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(product0, div0, null);
    			append_dev(div0, t2);
    			mount_component(product1, div0, null);
    			append_dev(div0, t3);
    			mount_component(product2, div0, null);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(product0.$$.fragment, local);
    			transition_in(product1.$$.fragment, local);
    			transition_in(product2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(product0.$$.fragment, local);
    			transition_out(product1.$$.fragment, local);
    			transition_out(product2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(product0);
    			destroy_component(product1);
    			destroy_component(product2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cart", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cart> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		beforeUpdate,
    		Product
    	});

    	return [];
    }

    class Cart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cart",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\RelatedProduct.svelte generated by Svelte v3.38.2 */

    const file$6 = "src\\components\\RelatedProduct.svelte";

    function create_fragment$6(ctx) {
    	let div3;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t2;
    	let div2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "superp gun for killing the enemy";
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "$800.99";
    			attr_dev(img, "class", "product-image");
    			if (img.src !== (img_src_value = "/static/images/gun.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Product name");
    			add_location(img, file$6, 6, 8, 149);
    			attr_dev(div0, "class", "product-image-wrapper");
    			set_style(div0, "margin-top", "-2px");
    			add_location(div0, file$6, 5, 4, 78);
    			attr_dev(div1, "class", "product-name");
    			add_location(div1, file$6, 8, 4, 242);
    			attr_dev(div2, "class", "bold");
    			add_location(div2, file$6, 9, 4, 312);
    			attr_dev(div3, "class", "product");
    			set_style(div3, "height", "150px");
    			add_location(div3, file$6, 4, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RelatedProduct", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RelatedProduct> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class RelatedProduct extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RelatedProduct",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\ProductDetails.svelte generated by Svelte v3.38.2 */
    const file$5 = "src\\components\\ProductDetails.svelte";

    function create_fragment$5(ctx) {
    	let div10;
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let h2;
    	let t4;
    	let div3;
    	let t6;
    	let div5;
    	let button;
    	let t8;
    	let div4;
    	let t10;
    	let div6;
    	let h30;
    	let t12;
    	let t13;
    	let div7;
    	let h31;
    	let t15;
    	let t16;
    	let div9;
    	let h32;
    	let t18;
    	let div8;
    	let relatedproduct0;
    	let t19;
    	let relatedproduct1;
    	let t20;
    	let relatedproduct2;
    	let t21;
    	let relatedproduct3;
    	let t22;
    	let relatedproduct4;
    	let t23;
    	let relatedproduct5;
    	let current;
    	relatedproduct0 = new RelatedProduct({ $$inline: true });
    	relatedproduct1 = new RelatedProduct({ $$inline: true });
    	relatedproduct2 = new RelatedProduct({ $$inline: true });
    	relatedproduct3 = new RelatedProduct({ $$inline: true });
    	relatedproduct4 = new RelatedProduct({ $$inline: true });
    	relatedproduct5 = new RelatedProduct({ $$inline: true });

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t1 = space();
    			img2 = element("img");
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "this is the product name";
    			t4 = space();
    			div3 = element("div");
    			div3.textContent = "34 in stock";
    			t6 = space();
    			div5 = element("div");
    			button = element("button");
    			button.textContent = "Add to cart";
    			t8 = space();
    			div4 = element("div");
    			div4.textContent = "Price: $800.99";
    			t10 = space();
    			div6 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Description:";
    			t12 = text("\r\n        this is the product description\r\n        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rerum, adipisci praesentium tempora aliquid quaerat ex, exercitationem totam ipsa soluta quia dolore, et doloremque! Expedita sed totam labore nihil reiciendis ducimus!");
    			t13 = space();
    			div7 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Reviews:";
    			t15 = text("\r\n        this are the customers review of this product");
    			t16 = space();
    			div9 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Related Products";
    			t18 = space();
    			div8 = element("div");
    			create_component(relatedproduct0.$$.fragment);
    			t19 = space();
    			create_component(relatedproduct1.$$.fragment);
    			t20 = space();
    			create_component(relatedproduct2.$$.fragment);
    			t21 = space();
    			create_component(relatedproduct3.$$.fragment);
    			t22 = space();
    			create_component(relatedproduct4.$$.fragment);
    			t23 = space();
    			create_component(relatedproduct5.$$.fragment);
    			if (img0.src !== (img0_src_value = "/static/images/gun.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "id", "product-image");
    			attr_dev(img0, "alt", "product name");
    			attr_dev(img0, "class", "svelte-1imtvbq");
    			add_location(img0, file$5, 55, 12, 2041);
    			attr_dev(div0, "id", "product-image-wrapper");
    			attr_dev(div0, "class", "svelte-1imtvbq");
    			add_location(div0, file$5, 54, 8, 1995);
    			if (img1.src !== (img1_src_value = "/static/images/gun.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "product name");
    			attr_dev(img1, "class", "product-details-image current-details-image");
    			add_location(img1, file$5, 58, 12, 2192);
    			if (img2.src !== (img2_src_value = "/static/images/gun.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "product name");
    			attr_dev(img2, "class", "product-details-image");
    			add_location(img2, file$5, 59, 12, 2313);
    			attr_dev(div1, "class", "product-details-images");
    			add_location(div1, file$5, 57, 8, 2141);
    			attr_dev(div2, "class", "product-details-carousel");
    			add_location(div2, file$5, 51, 4, 1713);
    			attr_dev(h2, "class", "product-details-name");
    			add_location(h2, file$5, 62, 4, 2432);
    			attr_dev(div3, "class", "products-in-stock bold");
    			add_location(div3, file$5, 63, 4, 2500);
    			attr_dev(button, "class", "add-to-cart svelte-1imtvbq");
    			add_location(button, file$5, 65, 8, 2587);
    			attr_dev(div4, "class", "product-price");
    			add_location(div4, file$5, 66, 8, 2645);
    			attr_dev(div5, "class", "flex");
    			add_location(div5, file$5, 64, 4, 2559);
    			attr_dev(h30, "class", "svelte-1imtvbq");
    			add_location(h30, file$5, 69, 8, 2761);
    			attr_dev(div6, "class", "product-details-description");
    			add_location(div6, file$5, 68, 4, 2710);
    			attr_dev(h31, "class", "svelte-1imtvbq");
    			add_location(h31, file$5, 74, 8, 3115);
    			attr_dev(div7, "class", "product-review");
    			add_location(div7, file$5, 73, 4, 3077);
    			attr_dev(h32, "class", "svelte-1imtvbq");
    			add_location(h32, file$5, 78, 8, 3245);
    			attr_dev(div8, "class", "related-products-wrapper");
    			add_location(div8, file$5, 79, 8, 3280);
    			attr_dev(div9, "class", "related-products");
    			add_location(div9, file$5, 77, 4, 3205);
    			attr_dev(div10, "class", "product-details");
    			add_location(div10, file$5, 49, 0, 1676);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, img1);
    			append_dev(div1, t1);
    			append_dev(div1, img2);
    			append_dev(div10, t2);
    			append_dev(div10, h2);
    			append_dev(div10, t4);
    			append_dev(div10, div3);
    			append_dev(div10, t6);
    			append_dev(div10, div5);
    			append_dev(div5, button);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div10, t10);
    			append_dev(div10, div6);
    			append_dev(div6, h30);
    			append_dev(div6, t12);
    			append_dev(div10, t13);
    			append_dev(div10, div7);
    			append_dev(div7, h31);
    			append_dev(div7, t15);
    			append_dev(div10, t16);
    			append_dev(div10, div9);
    			append_dev(div9, h32);
    			append_dev(div9, t18);
    			append_dev(div9, div8);
    			mount_component(relatedproduct0, div8, null);
    			append_dev(div8, t19);
    			mount_component(relatedproduct1, div8, null);
    			append_dev(div8, t20);
    			mount_component(relatedproduct2, div8, null);
    			append_dev(div8, t21);
    			mount_component(relatedproduct3, div8, null);
    			append_dev(div8, t22);
    			mount_component(relatedproduct4, div8, null);
    			append_dev(div8, t23);
    			mount_component(relatedproduct5, div8, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(relatedproduct0.$$.fragment, local);
    			transition_in(relatedproduct1.$$.fragment, local);
    			transition_in(relatedproduct2.$$.fragment, local);
    			transition_in(relatedproduct3.$$.fragment, local);
    			transition_in(relatedproduct4.$$.fragment, local);
    			transition_in(relatedproduct5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(relatedproduct0.$$.fragment, local);
    			transition_out(relatedproduct1.$$.fragment, local);
    			transition_out(relatedproduct2.$$.fragment, local);
    			transition_out(relatedproduct3.$$.fragment, local);
    			transition_out(relatedproduct4.$$.fragment, local);
    			transition_out(relatedproduct5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			destroy_component(relatedproduct0);
    			destroy_component(relatedproduct1);
    			destroy_component(relatedproduct2);
    			destroy_component(relatedproduct3);
    			destroy_component(relatedproduct4);
    			destroy_component(relatedproduct5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProductDetails", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProductDetails> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		Product,
    		RelatedProduct
    	});

    	return [];
    }

    class ProductDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProductDetails",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$4 = "src\\components\\Header.svelte";

    // (34:24) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("x");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(34:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:20) {#if searchValue == ""}
    function create_if_block(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:20) {#if searchValue == \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let header;
    	let ul1;
    	let li0;
    	let t1;
    	let li1;
    	let a0;
    	let svg0;
    	let path0;
    	let t2;
    	let li2;
    	let form;
    	let input;
    	let t3;
    	let button0;
    	let t4;
    	let button1;
    	let svg1;
    	let path1;
    	let t5;
    	let li3;
    	let svg2;
    	let path2;
    	let t6;
    	let ul0;
    	let a1;
    	let li4;
    	let svg3;
    	let path3;
    	let t7;
    	let div;
    	let t9;
    	let li5;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*searchValue*/ ctx[2] == "") return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			ul1 = element("ul");
    			li0 = element("li");
    			li0.textContent = "☰";
    			t1 = space();
    			li1 = element("li");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t2 = space();
    			li2 = element("li");
    			form = element("form");
    			input = element("input");
    			t3 = space();
    			button0 = element("button");
    			if_block.c();
    			t4 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t5 = space();
    			li3 = element("li");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t6 = space();
    			ul0 = element("ul");
    			a1 = element("a");
    			li4 = element("li");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			t7 = space();
    			div = element("div");
    			div.textContent = "7";
    			t9 = space();
    			li5 = element("li");
    			li5.textContent = "i";
    			attr_dev(li0, "class", "toggle-sidenav");
    			add_location(li0, file$4, 22, 8, 449);
    			attr_dev(path0, "id", "back");
    			attr_dev(path0, "d", "m175.94 24.328c-13.037.25172-26.009 3.8724-37.471 11.174l-58.557 37.316a67.134 67.134 0 0 0-30.355 44.906 70.794 70.794 0 0 0 6.959 45.445 67.224 67.224 0 0 0-10.035 25.102 71.535 71.535 0 0 0 12.236 54.156c23.351 33.41 69.468 43.311 102.81 22.07l58.559-37.158a67.359 67.359 0 0 0 30.355-44.906 70.771 70.771 0 0 0-6.9824-45.422 67.65 67.65 0 0 0 10.059-25.102 71.625 71.625 0 0 0-12.236-54.156v-.17969c-15.324-21.925-40.453-33.727-65.342-33.246zm5.1367 28.68a46.5 46.5 0 0 1 36.09 19.969 42.975 42.975 0 0 1 7.3652 32.557 45.242 45.242 0 0 1-1.3926 5.4551l-1.123 3.3691-2.9863-2.2461a75.846 75.846 0 0 0-22.902-11.451l-2.2441-.65039.20117-2.2461a13.157 13.157 0 0 0-2.3789-8.7109 13.988 13.988 0 0 0-14.953-5.4121 12.843 12.843 0 0 0-3.5938 1.5723l-58.578 37.25a12.237 12.237 0 0 0-5.502 8.1504 13.112 13.112 0 0 0 2.2461 9.834 14.033 14.033 0 0 0 14.93 5.5684 13.472 13.472 0 0 0 3.5937-1.5723l22.453-14.234a41.785 41.785 0 0 1 11.898-5.2324 46.477 46.477 0 0 1 49.914 18.502 43.02 43.02 0 0 1 7.3633 32.557 40.415 40.415 0 0 1-18.254 27.078l-58.58 37.316a43.065 43.065 0 0 1-11.898 5.2305 46.545 46.545 0 0 1-49.936-18.523 42.975 42.975 0 0 1-7.3418-32.557 38.17 38.17 0 0 1 1.3906-5.4102l1.1016-3.3691 3.0078 2.2461a75.846 75.846 0 0 0 22.836 11.361l2.2442.65039-.20118 2.2461a13.247 13.247 0 0 0 2.4473 8.6445 14.033 14.033 0 0 0 15.043 5.5684 13.135 13.135 0 0 0 3.5918-1.5723l58.467-37.316a12.169 12.169 0 0 0 5.502-8.1738 12.955 12.955 0 0 0-2.2461-9.8106 14.033 14.033 0 0 0-15.043-5.5684 12.843 12.843 0 0 0-3.5918 1.5703l-22.453 14.258a42.885 42.885 0 0 1-11.877 5.209 46.522 46.522 0 0 1-49.846-18.5 43.02 43.02 0 0 1-7.2969-32.557 40.415 40.415 0 0 1 18.254-27.078l58.646-37.316a42.773 42.773 0 0 1 11.811-5.209 46.5 46.5 0 0 1 13.822-1.4453z");
    			set_style(path0, "fill", "#ff5722");
    			set_style(path0, "stroke-width", "2.2453");
    			add_location(path0, file$4, 25, 104, 673);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "id", "svelte");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "viewBox", "0 0 300 300");
    			attr_dev(svg0, "class", "svelte-szjujd");
    			add_location(svg0, file$4, 25, 16, 585);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$4, 24, 12, 555);
    			attr_dev(li1, "class", "logo");
    			add_location(li1, file$4, 23, 8, 524);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "search");
    			attr_dev(input, "id", "search");
    			attr_dev(input, "placeholder", "Search for products");
    			add_location(input, file$4, 30, 16, 2625);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "clear-search-field");
    			add_location(button0, file$4, 31, 16, 2747);
    			attr_dev(path1, "d", "M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z");
    			add_location(path1, file$4, 38, 109, 3158);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "15px");
    			attr_dev(svg1, "height", "15px");
    			attr_dev(svg1, "viewBox", "0 0 512 512");
    			add_location(svg1, file$4, 38, 20, 3069);
    			attr_dev(button1, "class", "search-button");
    			button1.value = "submit";
    			add_location(button1, file$4, 37, 16, 3002);
    			add_location(form, file$4, 29, 12, 2578);
    			attr_dev(li2, "class", "search-link");
    			add_location(li2, file$4, 28, 8, 2540);
    			attr_dev(path2, "d", "M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z");
    			add_location(path2, file$4, 43, 101, 3729);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "width", "25px");
    			attr_dev(svg2, "height", "25px");
    			attr_dev(svg2, "viewBox", "0 0 512 512");
    			add_location(svg2, file$4, 43, 12, 3640);
    			attr_dev(li3, "class", "launch-search-panel");
    			add_location(li3, file$4, 42, 8, 3594);
    			attr_dev(path3, "d", "M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z");
    			add_location(path3, file$4, 48, 109, 4317);
    			attr_dev(svg3, "width", "25px");
    			attr_dev(svg3, "height", "25px");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "viewBox", "0 0 576 512");
    			add_location(svg3, file$4, 48, 20, 4228);
    			attr_dev(div, "class", "cart-count");
    			add_location(div, file$4, 49, 20, 4893);
    			attr_dev(li4, "class", "cart");
    			add_location(li4, file$4, 47, 16, 4189);
    			attr_dev(a1, "href", "#/cart");
    			add_location(a1, file$4, 46, 12, 4154);
    			attr_dev(li5, "class", "avatar");
    			add_location(li5, file$4, 52, 12, 4979);
    			attr_dev(ul0, "class", "cart-group");
    			add_location(ul0, file$4, 45, 8, 4117);
    			attr_dev(ul1, "class", "topnav");
    			add_location(ul1, file$4, 21, 4, 420);
    			add_location(header, file$4, 20, 0, 406);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, ul1);
    			append_dev(ul1, li0);
    			append_dev(ul1, t1);
    			append_dev(ul1, li1);
    			append_dev(li1, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(ul1, t2);
    			append_dev(ul1, li2);
    			append_dev(li2, form);
    			append_dev(form, input);
    			set_input_value(input, /*searchValue*/ ctx[2]);
    			append_dev(form, t3);
    			append_dev(form, button0);
    			if_block.m(button0, null);
    			append_dev(form, t4);
    			append_dev(form, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    			/*form_binding*/ ctx[5](form);
    			append_dev(ul1, t5);
    			append_dev(ul1, li3);
    			append_dev(li3, svg2);
    			append_dev(svg2, path2);
    			append_dev(ul1, t6);
    			append_dev(ul1, ul0);
    			append_dev(ul0, a1);
    			append_dev(a1, li4);
    			append_dev(li4, svg3);
    			append_dev(svg3, path3);
    			append_dev(li4, t7);
    			append_dev(li4, div);
    			append_dev(ul0, t9);
    			append_dev(ul0, li5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						li0,
    						"click",
    						function () {
    							if (is_function(/*toggleSidenav*/ ctx[0])) /*toggleSidenav*/ ctx[0].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(button0, "click", /*clearSearchField*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*searchValue*/ 4 && input.value !== /*searchValue*/ ctx[2]) {
    				set_input_value(input, /*searchValue*/ ctx[2]);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if_block.d();
    			/*form_binding*/ ctx[5](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let { toggleSidenav } = $$props;
    	let searchForm;
    	let searchValue = "";

    	function clearSearchField() {
    		$$invalidate(2, searchValue = "");
    	}

    	onMount(() => {
    		searchForm.addEventListener("submit", e => {
    			e.preventDefault();
    			console.log(searchValue);
    		});
    	});

    	const writable_props = ["toggleSidenav"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchValue = this.value;
    		$$invalidate(2, searchValue);
    	}

    	function form_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			searchForm = $$value;
    			$$invalidate(1, searchForm);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("toggleSidenav" in $$props) $$invalidate(0, toggleSidenav = $$props.toggleSidenav);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		beforeUpdate,
    		toggleSidenav,
    		searchForm,
    		searchValue,
    		clearSearchField
    	});

    	$$self.$inject_state = $$props => {
    		if ("toggleSidenav" in $$props) $$invalidate(0, toggleSidenav = $$props.toggleSidenav);
    		if ("searchForm" in $$props) $$invalidate(1, searchForm = $$props.searchForm);
    		if ("searchValue" in $$props) $$invalidate(2, searchValue = $$props.searchValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		toggleSidenav,
    		searchForm,
    		searchValue,
    		clearSearchField,
    		input_input_handler,
    		form_binding
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { toggleSidenav: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggleSidenav*/ ctx[0] === undefined && !("toggleSidenav" in props)) {
    			console_1.warn("<Header> was created without expected prop 'toggleSidenav'");
    		}
    	}

    	get toggleSidenav() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleSidenav(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Sidenav.svelte generated by Svelte v3.38.2 */
    const file$3 = "src\\components\\Sidenav.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let ul;
    	let a0;
    	let li0;
    	let t1;
    	let a1;
    	let li1;
    	let t3;
    	let a2;
    	let li2;
    	let t5;
    	let a3;
    	let li3;
    	let t7;
    	let a4;
    	let li4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");
    			a0 = element("a");
    			li0 = element("li");
    			li0.textContent = "men clothing";
    			t1 = space();
    			a1 = element("a");
    			li1 = element("li");
    			li1.textContent = "women clothing";
    			t3 = space();
    			a2 = element("a");
    			li2 = element("li");
    			li2.textContent = "children clothing";
    			t5 = space();
    			a3 = element("a");
    			li3 = element("li");
    			li3.textContent = "top-selling";
    			t7 = space();
    			a4 = element("a");
    			li4 = element("li");
    			li4.textContent = "men clothing";
    			attr_dev(li0, "class", "product-category svelte-91w4ky");
    			add_location(li0, file$3, 22, 12, 513);
    			attr_dev(a0, "href", "#/products/categories/men-clothing");
    			attr_dev(a0, "class", "svelte-91w4ky");
    			add_location(a0, file$3, 21, 8, 454);
    			attr_dev(li1, "class", "product-category svelte-91w4ky");
    			add_location(li1, file$3, 25, 12, 642);
    			attr_dev(a1, "href", "#/products/categories/men-clothing");
    			attr_dev(a1, "class", "svelte-91w4ky");
    			add_location(a1, file$3, 24, 8, 583);
    			attr_dev(li2, "class", "product-category svelte-91w4ky");
    			add_location(li2, file$3, 28, 12, 773);
    			attr_dev(a2, "href", "#/products/categories/men-clothing");
    			attr_dev(a2, "class", "svelte-91w4ky");
    			add_location(a2, file$3, 27, 8, 714);
    			attr_dev(li3, "class", "product-category svelte-91w4ky");
    			add_location(li3, file$3, 31, 12, 907);
    			attr_dev(a3, "href", "#/products/categories/men-clothing");
    			attr_dev(a3, "class", "svelte-91w4ky");
    			add_location(a3, file$3, 30, 8, 848);
    			attr_dev(li4, "class", "product-category svelte-91w4ky");
    			add_location(li4, file$3, 34, 12, 1035);
    			attr_dev(a4, "href", "#/products/categories/men-clothing");
    			attr_dev(a4, "class", "svelte-91w4ky");
    			add_location(a4, file$3, 33, 8, 976);
    			attr_dev(ul, "class", "product-categories svelte-91w4ky");
    			add_location(ul, file$3, 20, 4, 413);
    			attr_dev(div, "class", "sidenav");
    			add_location(div, file$3, 19, 0, 366);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    			append_dev(ul, a0);
    			append_dev(a0, li0);
    			append_dev(ul, t1);
    			append_dev(ul, a1);
    			append_dev(a1, li1);
    			append_dev(ul, t3);
    			append_dev(ul, a2);
    			append_dev(a2, li2);
    			append_dev(ul, t5);
    			append_dev(ul, a3);
    			append_dev(a3, li3);
    			append_dev(ul, t7);
    			append_dev(ul, a4);
    			append_dev(a4, li4);
    			/*div_binding*/ ctx[2](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sidenav", slots, []);
    	let { sidenavState } = $$props;
    	let sideNav;

    	afterUpdate(() => {
    		if (sidenavState) {
    			$$invalidate(0, sideNav.style.left = "0px", sideNav);
    		} else {
    			$$invalidate(0, sideNav.style.left = "-1000px", sideNav);
    		} // sideNav.style.left = "0px";
    	});

    	const writable_props = ["sidenavState"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidenav> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sideNav = $$value;
    			$$invalidate(0, sideNav);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("sidenavState" in $$props) $$invalidate(1, sidenavState = $$props.sidenavState);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		sidenavState,
    		sideNav
    	});

    	$$self.$inject_state = $$props => {
    		if ("sidenavState" in $$props) $$invalidate(1, sidenavState = $$props.sidenavState);
    		if ("sideNav" in $$props) $$invalidate(0, sideNav = $$props.sideNav);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sidenavState*/ 2) ;
    	};

    	return [sideNav, sidenavState, div_binding];
    }

    class Sidenav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { sidenavState: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidenav",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*sidenavState*/ ctx[1] === undefined && !("sidenavState" in props)) {
    			console.warn("<Sidenav> was created without expected prop 'sidenavState'");
    		}
    	}

    	get sidenavState() {
    		throw new Error("<Sidenav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sidenavState(value) {
    		throw new Error("<Sidenav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Home.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\components\\Home.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let products;
    	let current;
    	products = new Products({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(products.$$.fragment);
    			add_location(div, file$2, 35, 0, 760);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(products, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(products.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(products.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(products);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	let sidenavState = false;

    	function postitionSidenav() {
    		if (window.innerWidth >= 700) {
    			setTimeout(
    				() => {
    					sidenavState = true;
    				},
    				3
    			);
    		} else {
    			sidenavState = false;
    		}
    	}

    	onMount(() => {
    		postitionSidenav();
    	});

    	afterUpdate(() => {
    		window.addEventListener("resize", postitionSidenav);
    	});

    	beforeUpdate(() => {
    		window.removeEventListener("resize", postitionSidenav);
    	});

    	function toggleSidenav() {
    		sidenavState = !sidenavState;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		beforeUpdate,
    		Header,
    		Sidenav,
    		Products,
    		sidenavState,
    		postitionSidenav,
    		toggleSidenav
    	});

    	$$self.$inject_state = $$props => {
    		if ("sidenavState" in $$props) sidenavState = $$props.sidenavState;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Four0Four.svelte generated by Svelte v3.38.2 */

    const file$1 = "src\\components\\Four0Four.svelte";

    function create_fragment$1(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "404:( not found";
    			attr_dev(h1, "class", "svelte-1cxl6ib");
    			add_location(h1, file$1, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Four0Four", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Four0Four> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Four0Four extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Four0Four",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const routes = {
        "/": Home,
        "/products": Products,
        "/products/:id": ProductDetails,
        "/cart": Cart,
        "*": Four0Four
    };

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let header;
    	let t0;
    	let sidenav;
    	let t1;
    	let main;
    	let div;
    	let router;
    	let current;

    	header = new Header({
    			props: { toggleSidenav: /*toggleSidenav*/ ctx[1] },
    			$$inline: true
    		});

    	sidenav = new Sidenav({
    			props: { sidenavState: /*sidenavState*/ ctx[0] },
    			$$inline: true
    		});

    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(sidenav.$$.fragment);
    			t1 = space();
    			main = element("main");
    			div = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(div, "class", "main");
    			add_location(div, file, 39, 1, 899);
    			add_location(main, file, 38, 0, 891);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(sidenav, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(router, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidenav_changes = {};
    			if (dirty & /*sidenavState*/ 1) sidenav_changes.sidenavState = /*sidenavState*/ ctx[0];
    			sidenav.$set(sidenav_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(sidenav.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(sidenav.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(sidenav, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let sidenavState = false;

    	function postitionSidenav() {
    		if (window.innerWidth >= 700) {
    			setTimeout(
    				() => {
    					$$invalidate(0, sidenavState = true);
    				},
    				3
    			);
    		} else {
    			$$invalidate(0, sidenavState = false);
    		}
    	}

    	onMount(() => {
    		postitionSidenav();
    	});

    	afterUpdate(() => {
    		window.addEventListener("resize", postitionSidenav);
    	});

    	beforeUpdate(() => {
    		window.removeEventListener("resize", postitionSidenav);
    	});

    	function toggleSidenav() {
    		$$invalidate(0, sidenavState = !sidenavState);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		beforeUpdate,
    		Router,
    		routes,
    		Header,
    		Sidenav,
    		Products,
    		sidenavState,
    		postitionSidenav,
    		toggleSidenav
    	});

    	$$self.$inject_state = $$props => {
    		if ("sidenavState" in $$props) $$invalidate(0, sidenavState = $$props.sidenavState);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sidenavState, toggleSidenav];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
