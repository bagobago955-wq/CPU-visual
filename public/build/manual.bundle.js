
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text$1(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text$1(' ');
    }
    function empty() {
        return text$1('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

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

    function bind(component, name, callback, value) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            if (value === undefined) {
                callback(component.$$.ctx[index]);
            }
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
    function init$2(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.0' }, detail), { bubbles: true }));
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
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

    var State;
    (function (State) {
        State[State["Open"] = 0] = "Open";
        State[State["Closed"] = 1] = "Closed";
    })(State || (State = {}));
    const OPEN_CLOSED_CONTEXT_NAME = "headlessui-open-closed-context";
    function useOpenClosed() {
        return getContext(OPEN_CLOSED_CONTEXT_NAME);
    }
    function useOpenClosedProvider(value) {
        setContext(OPEN_CLOSED_CONTEXT_NAME, value);
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function match(value, lookup, ...args) {
        if (value in lookup) {
            let returnValue = lookup[value];
            return typeof returnValue === "function"
                ? returnValue(...args)
                : returnValue;
        }
        let error = new Error(`Tried to handle "${value}" but there is no handler defined. Only defined handlers are: ${Object.keys(lookup)
        .map((key) => `"${key}"`)
        .join(", ")}.`);
        if (Error.captureStackTrace)
            Error.captureStackTrace(error, match);
        throw error;
    }

    let id = 0;
    function generateId() {
        return ++id;
    }
    function useId() {
        return generateId();
    }

    // TODO: This must already exist somewhere, right? 🤔
    // Ref: https://www.w3.org/TR/uievents-key/#named-key-attribute-values
    var Keys;
    (function (Keys) {
        Keys["Space"] = " ";
        Keys["Enter"] = "Enter";
        Keys["Escape"] = "Escape";
        Keys["Backspace"] = "Backspace";
        Keys["ArrowLeft"] = "ArrowLeft";
        Keys["ArrowUp"] = "ArrowUp";
        Keys["ArrowRight"] = "ArrowRight";
        Keys["ArrowDown"] = "ArrowDown";
        Keys["Home"] = "Home";
        Keys["End"] = "End";
        Keys["PageUp"] = "PageUp";
        Keys["PageDown"] = "PageDown";
        Keys["Tab"] = "Tab";
    })(Keys || (Keys = {}));

    // Credit:
    //  - https://stackoverflow.com/a/30753870
    let focusableSelector = [
        "[contentEditable=true]",
        "[tabindex]",
        "a[href]",
        "area[href]",
        "button:not([disabled])",
        "iframe",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
    ]
        .map((selector) => `${selector}:not([tabindex='-1'])`)
        .join(",");
    var Focus$1;
    (function (Focus) {
        /** Focus the first non-disabled element */
        Focus[Focus["First"] = 1] = "First";
        /** Focus the previous non-disabled element */
        Focus[Focus["Previous"] = 2] = "Previous";
        /** Focus the next non-disabled element */
        Focus[Focus["Next"] = 4] = "Next";
        /** Focus the last non-disabled element */
        Focus[Focus["Last"] = 8] = "Last";
        /** Wrap tab around */
        Focus[Focus["WrapAround"] = 16] = "WrapAround";
        /** Prevent scrolling the focusable elements into view */
        Focus[Focus["NoScroll"] = 32] = "NoScroll";
    })(Focus$1 || (Focus$1 = {}));
    var FocusResult;
    (function (FocusResult) {
        FocusResult[FocusResult["Error"] = 0] = "Error";
        FocusResult[FocusResult["Overflow"] = 1] = "Overflow";
        FocusResult[FocusResult["Success"] = 2] = "Success";
        FocusResult[FocusResult["Underflow"] = 3] = "Underflow";
    })(FocusResult || (FocusResult = {}));
    var Direction;
    (function (Direction) {
        Direction[Direction["Previous"] = -1] = "Previous";
        Direction[Direction["Next"] = 1] = "Next";
    })(Direction || (Direction = {}));
    function getFocusableElements(container = document.body) {
        if (container == null)
            return [];
        return Array.from(container.querySelectorAll(focusableSelector));
    }
    var FocusableMode;
    (function (FocusableMode) {
        /** The element itself must be focusable. */
        FocusableMode[FocusableMode["Strict"] = 0] = "Strict";
        /** The element should be inside of a focusable element. */
        FocusableMode[FocusableMode["Loose"] = 1] = "Loose";
    })(FocusableMode || (FocusableMode = {}));
    function focusIn(container, focus) {
        let elements = Array.isArray(container)
            ? container
            : getFocusableElements(container);
        let active = document.activeElement;
        let direction = (() => {
            if (focus & (Focus$1.First | Focus$1.Next))
                return Direction.Next;
            if (focus & (Focus$1.Previous | Focus$1.Last))
                return Direction.Previous;
            throw new Error("Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last");
        })();
        let startIndex = (() => {
            if (focus & Focus$1.First)
                return 0;
            if (focus & Focus$1.Previous)
                return Math.max(0, elements.indexOf(active)) - 1;
            if (focus & Focus$1.Next)
                return Math.max(0, elements.indexOf(active)) + 1;
            if (focus & Focus$1.Last)
                return elements.length - 1;
            throw new Error("Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last");
        })();
        let focusOptions = focus & Focus$1.NoScroll ? { preventScroll: true } : {};
        let offset = 0;
        let total = elements.length;
        let next = undefined;
        do {
            // Guard against infinite loops
            if (offset >= total || offset + total <= 0)
                return FocusResult.Error;
            let nextIdx = startIndex + offset;
            if (focus & Focus$1.WrapAround) {
                nextIdx = (nextIdx + total) % total;
            }
            else {
                if (nextIdx < 0)
                    return FocusResult.Underflow;
                if (nextIdx >= total)
                    return FocusResult.Overflow;
            }
            next = elements[nextIdx];
            // Try the focus the next element, might not work if it is "hidden" to the user.
            next?.focus(focusOptions);
            // Try the next one in line
            offset += direction;
        } while (next !== document.activeElement);
        // This is a little weird, but let me try and explain: There are a few scenario's
        // in chrome for example where a focused `<a>` tag does not get the default focus
        // styles and sometimes they do. This highly depends on whether you started by
        // clicking or by using your keyboard. When you programmatically add focus `anchor.focus()`
        // then the active element (document.activeElement) is this anchor, which is expected.
        // However in that case the default focus styles are not applied *unless* you
        // also add this tabindex.
        if (!next.hasAttribute("tabindex"))
            next.setAttribute("tabindex", "0");
        return FocusResult.Success;
    }

    /* node_modules\@rgossiaux\svelte-headlessui\internal\StackContextProvider.svelte generated by Svelte v3.55.0 */

    var StackMessage;

    (function (StackMessage) {
    	StackMessage[StackMessage["Add"] = 0] = "Add";
    	StackMessage[StackMessage["Remove"] = 1] = "Remove";
    })(StackMessage || (StackMessage = {}));

    const MODIFIER_DIVIDER = "!";
    const modifierRegex = new RegExp(`^[^${MODIFIER_DIVIDER}]+(?:${MODIFIER_DIVIDER}(?:preventDefault|stopPropagation|passive|nonpassive|capture|once|self))+$`);
    function forwardEventsBuilder(component, except = []) {
        // This is our pseudo $on function. It is defined on component mount.
        let $on;
        // This is a list of events bound before mount.
        let events = [];
        // And we override the $on function to forward all bound events.
        component.$on = (fullEventType, callback) => {
            let eventType = fullEventType;
            let destructor = () => { };
            for (let exception of except) {
                if (typeof exception === "string" && exception === eventType) {
                    // Bail out of the event forwarding and run the normal Svelte $on() code
                    const callbacks = component.$$.callbacks[eventType] ||
                        (component.$$.callbacks[eventType] = []);
                    callbacks.push(callback);
                    return () => {
                        const index = callbacks.indexOf(callback);
                        if (index !== -1)
                            callbacks.splice(index, 1);
                    };
                }
                if (typeof exception === "object" && exception["name"] === eventType) {
                    let oldCallback = callback;
                    callback = (...props) => {
                        if (!(typeof exception === "object" && exception["shouldExclude"]())) {
                            oldCallback(...props);
                        }
                    };
                }
            }
            if ($on) {
                // The event was bound programmatically.
                destructor = $on(eventType, callback);
            }
            else {
                // The event was bound before mount by Svelte.
                events.push([eventType, callback]);
            }
            return () => {
                destructor();
            };
        };
        function forward(e) {
            // Internally bubble the event up from Svelte components.
            bubble(component, e);
        }
        return (node) => {
            const destructors = [];
            const forwardDestructors = {};
            // This function is responsible for listening and forwarding
            // all bound events.
            $on = (fullEventType, callback) => {
                let eventType = fullEventType;
                let handler = callback;
                // DOM addEventListener options argument.
                let options = false;
                const modifierMatch = eventType.match(modifierRegex);
                if (modifierMatch) {
                    // Parse the event modifiers.
                    // Supported modifiers:
                    // - preventDefault
                    // - stopPropagation
                    // - passive
                    // - nonpassive
                    // - capture
                    // - once
                    const parts = eventType.split(MODIFIER_DIVIDER);
                    eventType = parts[0];
                    const eventOptions = Object.fromEntries(parts.slice(1).map((mod) => [mod, true]));
                    if (eventOptions.passive) {
                        options = options || {};
                        options.passive = true;
                    }
                    if (eventOptions.nonpassive) {
                        options = options || {};
                        options.passive = false;
                    }
                    if (eventOptions.capture) {
                        options = options || {};
                        options.capture = true;
                    }
                    if (eventOptions.once) {
                        options = options || {};
                        options.once = true;
                    }
                    if (eventOptions.preventDefault) {
                        handler = prevent_default(handler);
                    }
                    if (eventOptions.stopPropagation) {
                        handler = stop_propagation(handler);
                    }
                }
                // Listen for the event directly, with the given options.
                const off = listen(node, eventType, handler, options);
                const destructor = () => {
                    off();
                    const idx = destructors.indexOf(destructor);
                    if (idx > -1) {
                        destructors.splice(idx, 1);
                    }
                };
                destructors.push(destructor);
                // Forward the event from Svelte.
                if (!(eventType in forwardDestructors)) {
                    forwardDestructors[eventType] = listen(node, eventType, forward);
                }
                return destructor;
            };
            for (let i = 0; i < events.length; i++) {
                // Listen to all the events added before mount.
                $on(events[i][0], events[i][1]);
            }
            return {
                destroy: () => {
                    // Remove all event listeners.
                    for (let i = 0; i < destructors.length; i++) {
                        destructors[i]();
                    }
                    // Remove all event forwarders.
                    for (let entry of Object.entries(forwardDestructors)) {
                        entry[1]();
                    }
                },
            };
        };
    }

    const components = [
        "a",
        "address",
        "article",
        "aside",
        "b",
        "bdi",
        "bdo",
        "blockquote",
        "button",
        "cite",
        "code",
        "data",
        "datalist",
        "dd",
        "dl",
        "dt",
        "div",
        "em",
        "footer",
        "form",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "i",
        "input",
        "label",
        "li",
        "main",
        "nav",
        "ol",
        "p",
        "section",
        "span",
        "strong",
        "ul",
    ];
    function isValidElement(element) {
        return !(typeof element === "string" && !components.includes(element));
    }

    function useActions(node, actions) {
        let actionReturns = [];
        if (actions) {
            for (let i = 0; i < actions.length; i++) {
                const actionEntry = actions[i];
                const action = Array.isArray(actionEntry) ? actionEntry[0] : actionEntry;
                if (Array.isArray(actionEntry) && actionEntry.length > 1) {
                    actionReturns.push(action(node, actionEntry[1]));
                }
                else {
                    actionReturns.push(action(node));
                }
            }
        }
        return {
            update(actions) {
                if (((actions && actions.length) || 0) != actionReturns.length) {
                    throw new Error("You must not change the length of an actions array.");
                }
                if (actions) {
                    for (let i = 0; i < actions.length; i++) {
                        const returnEntry = actionReturns[i];
                        if (returnEntry && returnEntry.update) {
                            const actionEntry = actions[i];
                            if (Array.isArray(actionEntry) && actionEntry.length > 1) {
                                returnEntry.update(actionEntry[1]);
                            }
                            else {
                                returnEntry.update();
                            }
                        }
                    }
                }
            },
            destroy() {
                for (let i = 0; i < actionReturns.length; i++) {
                    const returnEntry = actionReturns[i];
                    if (returnEntry && returnEntry.destroy) {
                        returnEntry.destroy();
                    }
                }
            },
        };
    }

    /// <reference types="svelte2tsx/svelte-jsx" />
    // Can't figure out how to import from Render.svelte, so this must be moved here instead.
    var Features;
    (function (Features) {
        /** No features at all */
        Features[Features["None"] = 0] = "None";
        /**
         * When used, this will allow us to use one of the render strategies.
         *
         * **The render strategies are:**
         *    - **Unmount**   _(Will unmount the component.)_
         *    - **Hidden**    _(Will hide the component using the [hidden] attribute.)_
         */
        Features[Features["RenderStrategy"] = 1] = "RenderStrategy";
        /**
         * When used, this will allow the user of our component to be in control. This can be used when
         * you want to transition based on some state.
         */
        Features[Features["Static"] = 2] = "Static";
    })(Features || (Features = {}));

    /* node_modules\@rgossiaux\svelte-headlessui\utils\Render.svelte generated by Svelte v3.55.0 */

    const { Error: Error_1$2 } = globals;
    const file$f = "node_modules\\@rgossiaux\\svelte-headlessui\\utils\\Render.svelte";

    // (56:0) {#if show}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block_1$1,
    		create_if_block_2$1,
    		create_if_block_3$1,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7,
    		create_if_block_8,
    		create_if_block_9,
    		create_if_block_10,
    		create_if_block_11,
    		create_if_block_12,
    		create_if_block_13,
    		create_if_block_14,
    		create_if_block_15,
    		create_if_block_16,
    		create_if_block_17,
    		create_if_block_18,
    		create_if_block_19,
    		create_if_block_20,
    		create_if_block_21,
    		create_if_block_22,
    		create_if_block_23,
    		create_if_block_24,
    		create_if_block_25,
    		create_if_block_26,
    		create_if_block_27,
    		create_if_block_28,
    		create_if_block_29,
    		create_if_block_30,
    		create_if_block_31,
    		create_if_block_32,
    		create_if_block_33,
    		create_if_block_34,
    		create_if_block_35,
    		create_if_block_36,
    		create_if_block_37,
    		create_if_block_38,
    		create_if_block_39,
    		create_else_block
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*as*/ ctx[1] === "a") return 0;
    		if (/*as*/ ctx[1] === "address") return 1;
    		if (/*as*/ ctx[1] === "article") return 2;
    		if (/*as*/ ctx[1] === "aside") return 3;
    		if (/*as*/ ctx[1] === "b") return 4;
    		if (/*as*/ ctx[1] === "bdi") return 5;
    		if (/*as*/ ctx[1] === "bdo") return 6;
    		if (/*as*/ ctx[1] === "blockquote") return 7;
    		if (/*as*/ ctx[1] === "button") return 8;
    		if (/*as*/ ctx[1] === "cite") return 9;
    		if (/*as*/ ctx[1] === "code") return 10;
    		if (/*as*/ ctx[1] === "data") return 11;
    		if (/*as*/ ctx[1] === "datalist") return 12;
    		if (/*as*/ ctx[1] === "dd") return 13;
    		if (/*as*/ ctx[1] === "dl") return 14;
    		if (/*as*/ ctx[1] === "dt") return 15;
    		if (/*as*/ ctx[1] === "div") return 16;
    		if (/*as*/ ctx[1] === "em") return 17;
    		if (/*as*/ ctx[1] === "footer") return 18;
    		if (/*as*/ ctx[1] === "form") return 19;
    		if (/*as*/ ctx[1] === "h1") return 20;
    		if (/*as*/ ctx[1] === "h2") return 21;
    		if (/*as*/ ctx[1] === "h3") return 22;
    		if (/*as*/ ctx[1] === "h4") return 23;
    		if (/*as*/ ctx[1] === "h5") return 24;
    		if (/*as*/ ctx[1] === "h6") return 25;
    		if (/*as*/ ctx[1] === "header") return 26;
    		if (/*as*/ ctx[1] === "i") return 27;
    		if (/*as*/ ctx[1] === "input") return 28;
    		if (/*as*/ ctx[1] === "label") return 29;
    		if (/*as*/ ctx[1] === "li") return 30;
    		if (/*as*/ ctx[1] === "main") return 31;
    		if (/*as*/ ctx[1] === "nav") return 32;
    		if (/*as*/ ctx[1] === "ol") return 33;
    		if (/*as*/ ctx[1] === "p") return 34;
    		if (/*as*/ ctx[1] === "section") return 35;
    		if (/*as*/ ctx[1] === "span") return 36;
    		if (/*as*/ ctx[1] === "strong") return 37;
    		if (/*as*/ ctx[1] === "ul") return 38;
    		return 39;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(56:0) {#if show}",
    		ctx
    	});

    	return block;
    }

    // (491:2) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let updating_el;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [.../*use*/ ctx[2], /*forwardEvents*/ ctx[6]]
    		},
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{ hidden: /*hidden*/ ctx[4] || undefined }
    	];

    	function switch_instance_el_binding(value) {
    		/*switch_instance_el_binding*/ ctx[58](value);
    	}

    	var switch_value = /*as*/ ctx[1];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$l] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		if (/*el*/ ctx[0] !== void 0) {
    			switch_instance_props.el = /*el*/ ctx[0];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, 'el', switch_instance_el_binding, /*el*/ ctx[0]));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*use, forwardEvents, $$restProps, propsWeControl, hidden*/ 220)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*use, forwardEvents*/ 68 && {
    						use: [.../*use*/ ctx[2], /*forwardEvents*/ ctx[6]]
    					},
    					dirty[0] & /*$$restProps*/ 128 && get_spread_object(/*$$restProps*/ ctx[7]),
    					dirty[0] & /*propsWeControl*/ 8 && get_spread_object(/*propsWeControl*/ ctx[3]),
    					dirty[0] & /*hidden*/ 16 && { hidden: /*hidden*/ ctx[4] || undefined }
    				])
    			: {};

    			if (dirty[1] & /*$$scope*/ 268435456) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_el && dirty[0] & /*el*/ 1) {
    				updating_el = true;
    				switch_instance_changes.el = /*el*/ ctx[0];
    				add_flush_callback(() => updating_el = false);
    			}

    			if (switch_value !== (switch_value = /*as*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, 'el', switch_instance_el_binding, /*el*/ ctx[0]));
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(491:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (480:24) 
    function create_if_block_39(ctx) {
    	let ul;
    	let ul_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let ul_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: ul_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let ul_data = {};

    	for (let i = 0; i < ul_levels.length; i += 1) {
    		ul_data = assign(ul_data, ul_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			set_attributes(ul, ul_data);
    			add_location(ul, file$f, 480, 4, 10948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			/*ul_binding*/ ctx[57](ul);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, ul, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, ul))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(ul, ul_data = get_spread_update(ul_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && ul_hidden_value !== (ul_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: ul_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    			/*ul_binding*/ ctx[57](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_39.name,
    		type: "if",
    		source: "(480:24) ",
    		ctx
    	});

    	return block;
    }

    // (469:28) 
    function create_if_block_38(ctx) {
    	let strong;
    	let strong_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let strong_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: strong_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let strong_data = {};

    	for (let i = 0; i < strong_levels.length; i += 1) {
    		strong_data = assign(strong_data, strong_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			strong = element("strong");
    			if (default_slot) default_slot.c();
    			set_attributes(strong, strong_data);
    			add_location(strong, file$f, 469, 4, 10720);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, strong, anchor);

    			if (default_slot) {
    				default_slot.m(strong, null);
    			}

    			/*strong_binding*/ ctx[56](strong);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, strong, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, strong))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(strong, strong_data = get_spread_update(strong_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && strong_hidden_value !== (strong_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: strong_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(strong);
    			if (default_slot) default_slot.d(detaching);
    			/*strong_binding*/ ctx[56](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_38.name,
    		type: "if",
    		source: "(469:28) ",
    		ctx
    	});

    	return block;
    }

    // (458:26) 
    function create_if_block_37(ctx) {
    	let span;
    	let span_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let span_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: span_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    			add_location(span, file$f, 458, 4, 10492);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*span_binding*/ ctx[55](span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && span_hidden_value !== (span_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: span_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			/*span_binding*/ ctx[55](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_37.name,
    		type: "if",
    		source: "(458:26) ",
    		ctx
    	});

    	return block;
    }

    // (447:29) 
    function create_if_block_36(ctx) {
    	let section;
    	let section_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let section_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: section_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let section_data = {};

    	for (let i = 0; i < section_levels.length; i += 1) {
    		section_data = assign(section_data, section_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			set_attributes(section, section_data);
    			add_location(section, file$f, 447, 4, 10260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			/*section_binding*/ ctx[54](section);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, section, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, section))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(section, section_data = get_spread_update(section_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && section_hidden_value !== (section_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: section_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			/*section_binding*/ ctx[54](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_36.name,
    		type: "if",
    		source: "(447:29) ",
    		ctx
    	});

    	return block;
    }

    // (436:23) 
    function create_if_block_35(ctx) {
    	let p;
    	let p_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let p_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: p_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let p_data = {};

    	for (let i = 0; i < p_levels.length; i += 1) {
    		p_data = assign(p_data, p_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			if (default_slot) default_slot.c();
    			set_attributes(p, p_data);
    			add_location(p, file$f, 436, 4, 10037);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			/*p_binding*/ ctx[53](p);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, p, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, p))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(p, p_data = get_spread_update(p_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && p_hidden_value !== (p_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: p_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (default_slot) default_slot.d(detaching);
    			/*p_binding*/ ctx[53](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_35.name,
    		type: "if",
    		source: "(436:23) ",
    		ctx
    	});

    	return block;
    }

    // (425:24) 
    function create_if_block_34(ctx) {
    	let ol;
    	let ol_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let ol_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: ol_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let ol_data = {};

    	for (let i = 0; i < ol_levels.length; i += 1) {
    		ol_data = assign(ol_data, ol_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			ol = element("ol");
    			if (default_slot) default_slot.c();
    			set_attributes(ol, ol_data);
    			add_location(ol, file$f, 425, 4, 9818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ol, anchor);

    			if (default_slot) {
    				default_slot.m(ol, null);
    			}

    			/*ol_binding*/ ctx[52](ol);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, ol, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, ol))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(ol, ol_data = get_spread_update(ol_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && ol_hidden_value !== (ol_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: ol_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ol);
    			if (default_slot) default_slot.d(detaching);
    			/*ol_binding*/ ctx[52](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_34.name,
    		type: "if",
    		source: "(425:24) ",
    		ctx
    	});

    	return block;
    }

    // (414:25) 
    function create_if_block_33(ctx) {
    	let nav;
    	let nav_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let nav_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: nav_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let nav_data = {};

    	for (let i = 0; i < nav_levels.length; i += 1) {
    		nav_data = assign(nav_data, nav_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if (default_slot) default_slot.c();
    			set_attributes(nav, nav_data);
    			add_location(nav, file$f, 414, 4, 9596);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			if (default_slot) {
    				default_slot.m(nav, null);
    			}

    			/*nav_binding*/ ctx[51](nav);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, nav, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, nav))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(nav, nav_data = get_spread_update(nav_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && nav_hidden_value !== (nav_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: nav_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (default_slot) default_slot.d(detaching);
    			/*nav_binding*/ ctx[51](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_33.name,
    		type: "if",
    		source: "(414:25) ",
    		ctx
    	});

    	return block;
    }

    // (403:26) 
    function create_if_block_32(ctx) {
    	let main;
    	let main_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let main_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: main_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let main_data = {};

    	for (let i = 0; i < main_levels.length; i += 1) {
    		main_data = assign(main_data, main_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (default_slot) default_slot.c();
    			set_attributes(main, main_data);
    			add_location(main, file$f, 403, 4, 9371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			/*main_binding*/ ctx[50](main);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, main, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, main))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(main, main_data = get_spread_update(main_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && main_hidden_value !== (main_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: main_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			/*main_binding*/ ctx[50](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_32.name,
    		type: "if",
    		source: "(403:26) ",
    		ctx
    	});

    	return block;
    }

    // (392:24) 
    function create_if_block_31(ctx) {
    	let li;
    	let li_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let li_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: li_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			set_attributes(li, li_data);
    			add_location(li, file$f, 392, 4, 9149);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			/*li_binding*/ ctx[49](li);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, li, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, li))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(li, li_data = get_spread_update(li_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && li_hidden_value !== (li_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: li_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    			/*li_binding*/ ctx[49](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_31.name,
    		type: "if",
    		source: "(392:24) ",
    		ctx
    	});

    	return block;
    }

    // (380:27) 
    function create_if_block_30(ctx) {
    	let label;
    	let label_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let label_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: label_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let label_data = {};

    	for (let i = 0; i < label_levels.length; i += 1) {
    		label_data = assign(label_data, label_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot) default_slot.c();
    			set_attributes(label, label_data);
    			add_location(label, file$f, 381, 4, 8923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			/*label_binding*/ ctx[48](label);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, label, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, label))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(label, label_data = get_spread_update(label_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && label_hidden_value !== (label_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: label_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    			/*label_binding*/ ctx[48](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_30.name,
    		type: "if",
    		source: "(380:27) ",
    		ctx
    	});

    	return block;
    }

    // (371:27) 
    function create_if_block_29(ctx) {
    	let input;
    	let input_hidden_value;
    	let useActions_action;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: input_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$f, 371, 4, 8660);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			/*input_binding*/ ctx[47](input);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, input, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, input))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				dirty[0] & /*hidden*/ 16 && input_hidden_value !== (input_hidden_value = /*hidden*/ ctx[4] || undefined) && { hidden: input_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[47](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_29.name,
    		type: "if",
    		source: "(371:27) ",
    		ctx
    	});

    	return block;
    }

    // (360:23) 
    function create_if_block_28(ctx) {
    	let i;
    	let i_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let i_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: i_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let i_data = {};

    	for (let i = 0; i < i_levels.length; i += 1) {
    		i_data = assign(i_data, i_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (default_slot) default_slot.c();
    			set_attributes(i, i_data);
    			add_location(i, file$f, 360, 4, 8439);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			/*i_binding*/ ctx[46](i);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, i, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, i))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(i, i_data = get_spread_update(i_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && i_hidden_value !== (i_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: i_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (default_slot) default_slot.d(detaching);
    			/*i_binding*/ ctx[46](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_28.name,
    		type: "if",
    		source: "(360:23) ",
    		ctx
    	});

    	return block;
    }

    // (349:28) 
    function create_if_block_27(ctx) {
    	let header;
    	let header_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let header_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: header_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let header_data = {};

    	for (let i = 0; i < header_levels.length; i += 1) {
    		header_data = assign(header_data, header_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			if (default_slot) default_slot.c();
    			set_attributes(header, header_data);
    			add_location(header, file$f, 349, 4, 8212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);

    			if (default_slot) {
    				default_slot.m(header, null);
    			}

    			/*header_binding*/ ctx[45](header);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, header, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, header))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(header, header_data = get_spread_update(header_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && header_hidden_value !== (header_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: header_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (default_slot) default_slot.d(detaching);
    			/*header_binding*/ ctx[45](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_27.name,
    		type: "if",
    		source: "(349:28) ",
    		ctx
    	});

    	return block;
    }

    // (338:24) 
    function create_if_block_26(ctx) {
    	let h6;
    	let h6_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let h6_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: h6_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let h6_data = {};

    	for (let i = 0; i < h6_levels.length; i += 1) {
    		h6_data = assign(h6_data, h6_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			if (default_slot) default_slot.c();
    			set_attributes(h6, h6_data);
    			add_location(h6, file$f, 338, 4, 7988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);

    			if (default_slot) {
    				default_slot.m(h6, null);
    			}

    			/*h6_binding*/ ctx[44](h6);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h6, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, h6))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h6, h6_data = get_spread_update(h6_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && h6_hidden_value !== (h6_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: h6_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    			if (default_slot) default_slot.d(detaching);
    			/*h6_binding*/ ctx[44](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(338:24) ",
    		ctx
    	});

    	return block;
    }

    // (327:24) 
    function create_if_block_25(ctx) {
    	let h5;
    	let h5_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let h5_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: h5_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let h5_data = {};

    	for (let i = 0; i < h5_levels.length; i += 1) {
    		h5_data = assign(h5_data, h5_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			if (default_slot) default_slot.c();
    			set_attributes(h5, h5_data);
    			add_location(h5, file$f, 327, 4, 7768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);

    			if (default_slot) {
    				default_slot.m(h5, null);
    			}

    			/*h5_binding*/ ctx[43](h5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h5, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, h5))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h5, h5_data = get_spread_update(h5_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && h5_hidden_value !== (h5_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: h5_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (default_slot) default_slot.d(detaching);
    			/*h5_binding*/ ctx[43](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(327:24) ",
    		ctx
    	});

    	return block;
    }

    // (316:24) 
    function create_if_block_24(ctx) {
    	let h4;
    	let h4_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let h4_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: h4_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let h4_data = {};

    	for (let i = 0; i < h4_levels.length; i += 1) {
    		h4_data = assign(h4_data, h4_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			if (default_slot) default_slot.c();
    			set_attributes(h4, h4_data);
    			add_location(h4, file$f, 316, 4, 7548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);

    			if (default_slot) {
    				default_slot.m(h4, null);
    			}

    			/*h4_binding*/ ctx[42](h4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h4, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, h4))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h4, h4_data = get_spread_update(h4_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && h4_hidden_value !== (h4_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: h4_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (default_slot) default_slot.d(detaching);
    			/*h4_binding*/ ctx[42](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(316:24) ",
    		ctx
    	});

    	return block;
    }

    // (305:24) 
    function create_if_block_23(ctx) {
    	let h3;
    	let h3_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let h3_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: h3_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let h3_data = {};

    	for (let i = 0; i < h3_levels.length; i += 1) {
    		h3_data = assign(h3_data, h3_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			if (default_slot) default_slot.c();
    			set_attributes(h3, h3_data);
    			add_location(h3, file$f, 305, 4, 7328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);

    			if (default_slot) {
    				default_slot.m(h3, null);
    			}

    			/*h3_binding*/ ctx[41](h3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h3, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, h3))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h3, h3_data = get_spread_update(h3_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && h3_hidden_value !== (h3_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: h3_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (default_slot) default_slot.d(detaching);
    			/*h3_binding*/ ctx[41](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(305:24) ",
    		ctx
    	});

    	return block;
    }

    // (294:24) 
    function create_if_block_22(ctx) {
    	let h2;
    	let h2_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let h2_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: h2_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let h2_data = {};

    	for (let i = 0; i < h2_levels.length; i += 1) {
    		h2_data = assign(h2_data, h2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			if (default_slot) default_slot.c();
    			set_attributes(h2, h2_data);
    			add_location(h2, file$f, 294, 4, 7108);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);

    			if (default_slot) {
    				default_slot.m(h2, null);
    			}

    			/*h2_binding*/ ctx[40](h2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h2, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, h2))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h2, h2_data = get_spread_update(h2_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && h2_hidden_value !== (h2_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: h2_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (default_slot) default_slot.d(detaching);
    			/*h2_binding*/ ctx[40](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(294:24) ",
    		ctx
    	});

    	return block;
    }

    // (283:24) 
    function create_if_block_21(ctx) {
    	let h1;
    	let h1_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let h1_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: h1_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let h1_data = {};

    	for (let i = 0; i < h1_levels.length; i += 1) {
    		h1_data = assign(h1_data, h1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			if (default_slot) default_slot.c();
    			set_attributes(h1, h1_data);
    			add_location(h1, file$f, 283, 4, 6888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);

    			if (default_slot) {
    				default_slot.m(h1, null);
    			}

    			/*h1_binding*/ ctx[39](h1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h1, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, h1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h1, h1_data = get_spread_update(h1_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && h1_hidden_value !== (h1_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: h1_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (default_slot) default_slot.d(detaching);
    			/*h1_binding*/ ctx[39](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(283:24) ",
    		ctx
    	});

    	return block;
    }

    // (272:26) 
    function create_if_block_20(ctx) {
    	let form;
    	let form_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let form_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: form_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let form_data = {};

    	for (let i = 0; i < form_levels.length; i += 1) {
    		form_data = assign(form_data, form_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			if (default_slot) default_slot.c();
    			set_attributes(form, form_data);
    			add_location(form, file$f, 272, 4, 6664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);

    			if (default_slot) {
    				default_slot.m(form, null);
    			}

    			/*form_binding*/ ctx[38](form);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, form, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, form))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(form, form_data = get_spread_update(form_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && form_hidden_value !== (form_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: form_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (default_slot) default_slot.d(detaching);
    			/*form_binding*/ ctx[38](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(272:26) ",
    		ctx
    	});

    	return block;
    }

    // (261:28) 
    function create_if_block_19(ctx) {
    	let footer;
    	let footer_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let footer_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: footer_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let footer_data = {};

    	for (let i = 0; i < footer_levels.length; i += 1) {
    		footer_data = assign(footer_data, footer_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			if (default_slot) default_slot.c();
    			set_attributes(footer, footer_data);
    			add_location(footer, file$f, 261, 4, 6434);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);

    			if (default_slot) {
    				default_slot.m(footer, null);
    			}

    			/*footer_binding*/ ctx[37](footer);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, footer, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, footer))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(footer, footer_data = get_spread_update(footer_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && footer_hidden_value !== (footer_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: footer_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			if (default_slot) default_slot.d(detaching);
    			/*footer_binding*/ ctx[37](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(261:28) ",
    		ctx
    	});

    	return block;
    }

    // (250:24) 
    function create_if_block_18(ctx) {
    	let em;
    	let em_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let em_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: em_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let em_data = {};

    	for (let i = 0; i < em_levels.length; i += 1) {
    		em_data = assign(em_data, em_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			em = element("em");
    			if (default_slot) default_slot.c();
    			set_attributes(em, em_data);
    			add_location(em, file$f, 250, 4, 6210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, em, anchor);

    			if (default_slot) {
    				default_slot.m(em, null);
    			}

    			/*em_binding*/ ctx[36](em);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, em, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, em))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(em, em_data = get_spread_update(em_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && em_hidden_value !== (em_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: em_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(em);
    			if (default_slot) default_slot.d(detaching);
    			/*em_binding*/ ctx[36](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(250:24) ",
    		ctx
    	});

    	return block;
    }

    // (239:25) 
    function create_if_block_17(ctx) {
    	let div;
    	let div_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let div_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: div_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$f, 239, 4, 5988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[35](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && div_hidden_value !== (div_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: div_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[35](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(239:25) ",
    		ctx
    	});

    	return block;
    }

    // (228:24) 
    function create_if_block_16(ctx) {
    	let dt;
    	let dt_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let dt_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: dt_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let dt_data = {};

    	for (let i = 0; i < dt_levels.length; i += 1) {
    		dt_data = assign(dt_data, dt_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			dt = element("dt");
    			if (default_slot) default_slot.c();
    			set_attributes(dt, dt_data);
    			add_location(dt, file$f, 228, 4, 5767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dt, anchor);

    			if (default_slot) {
    				default_slot.m(dt, null);
    			}

    			/*dt_binding*/ ctx[34](dt);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, dt, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, dt))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(dt, dt_data = get_spread_update(dt_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && dt_hidden_value !== (dt_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: dt_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dt);
    			if (default_slot) default_slot.d(detaching);
    			/*dt_binding*/ ctx[34](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(228:24) ",
    		ctx
    	});

    	return block;
    }

    // (217:24) 
    function create_if_block_15(ctx) {
    	let dl;
    	let dl_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let dl_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: dl_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let dl_data = {};

    	for (let i = 0; i < dl_levels.length; i += 1) {
    		dl_data = assign(dl_data, dl_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			dl = element("dl");
    			if (default_slot) default_slot.c();
    			set_attributes(dl, dl_data);
    			add_location(dl, file$f, 217, 4, 5547);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dl, anchor);

    			if (default_slot) {
    				default_slot.m(dl, null);
    			}

    			/*dl_binding*/ ctx[33](dl);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, dl, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, dl))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(dl, dl_data = get_spread_update(dl_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && dl_hidden_value !== (dl_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: dl_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dl);
    			if (default_slot) default_slot.d(detaching);
    			/*dl_binding*/ ctx[33](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(217:24) ",
    		ctx
    	});

    	return block;
    }

    // (206:24) 
    function create_if_block_14(ctx) {
    	let dd;
    	let dd_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let dd_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: dd_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let dd_data = {};

    	for (let i = 0; i < dd_levels.length; i += 1) {
    		dd_data = assign(dd_data, dd_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			dd = element("dd");
    			if (default_slot) default_slot.c();
    			set_attributes(dd, dd_data);
    			add_location(dd, file$f, 206, 4, 5327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dd, anchor);

    			if (default_slot) {
    				default_slot.m(dd, null);
    			}

    			/*dd_binding*/ ctx[32](dd);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, dd, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, dd))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(dd, dd_data = get_spread_update(dd_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && dd_hidden_value !== (dd_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: dd_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dd);
    			if (default_slot) default_slot.d(detaching);
    			/*dd_binding*/ ctx[32](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(206:24) ",
    		ctx
    	});

    	return block;
    }

    // (195:30) 
    function create_if_block_13(ctx) {
    	let datalist;
    	let datalist_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let datalist_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: datalist_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let datalist_data = {};

    	for (let i = 0; i < datalist_levels.length; i += 1) {
    		datalist_data = assign(datalist_data, datalist_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			datalist = element("datalist");
    			if (default_slot) default_slot.c();
    			set_attributes(datalist, datalist_data);
    			add_location(datalist, file$f, 195, 4, 5095);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, datalist, anchor);

    			if (default_slot) {
    				default_slot.m(datalist, null);
    			}

    			/*datalist_binding*/ ctx[31](datalist);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, datalist, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, datalist))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(datalist, datalist_data = get_spread_update(datalist_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && datalist_hidden_value !== (datalist_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: datalist_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(datalist);
    			if (default_slot) default_slot.d(detaching);
    			/*datalist_binding*/ ctx[31](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(195:30) ",
    		ctx
    	});

    	return block;
    }

    // (184:26) 
    function create_if_block_12(ctx) {
    	let data;
    	let data_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let data_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: data_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let data_data = {};

    	for (let i = 0; i < data_levels.length; i += 1) {
    		data_data = assign(data_data, data_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			data = element("data");
    			if (default_slot) default_slot.c();
    			set_attributes(data, data_data);
    			add_location(data, file$f, 184, 4, 4865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, data, anchor);

    			if (default_slot) {
    				default_slot.m(data, null);
    			}

    			/*data_binding*/ ctx[30](data);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, data, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, data))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(data, data_data = get_spread_update(data_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && data_hidden_value !== (data_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: data_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(data);
    			if (default_slot) default_slot.d(detaching);
    			/*data_binding*/ ctx[30](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(184:26) ",
    		ctx
    	});

    	return block;
    }

    // (173:26) 
    function create_if_block_11(ctx) {
    	let code;
    	let code_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let code_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: code_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let code_data = {};

    	for (let i = 0; i < code_levels.length; i += 1) {
    		code_data = assign(code_data, code_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			code = element("code");
    			if (default_slot) default_slot.c();
    			set_attributes(code, code_data);
    			add_location(code, file$f, 173, 4, 4639);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, code, anchor);

    			if (default_slot) {
    				default_slot.m(code, null);
    			}

    			/*code_binding*/ ctx[29](code);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, code, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, code))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(code, code_data = get_spread_update(code_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && code_hidden_value !== (code_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: code_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(code);
    			if (default_slot) default_slot.d(detaching);
    			/*code_binding*/ ctx[29](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(173:26) ",
    		ctx
    	});

    	return block;
    }

    // (162:26) 
    function create_if_block_10(ctx) {
    	let cite;
    	let cite_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let cite_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: cite_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let cite_data = {};

    	for (let i = 0; i < cite_levels.length; i += 1) {
    		cite_data = assign(cite_data, cite_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			cite = element("cite");
    			if (default_slot) default_slot.c();
    			set_attributes(cite, cite_data);
    			add_location(cite, file$f, 162, 4, 4413);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, cite, anchor);

    			if (default_slot) {
    				default_slot.m(cite, null);
    			}

    			/*cite_binding*/ ctx[28](cite);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, cite, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, cite))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(cite, cite_data = get_spread_update(cite_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && cite_hidden_value !== (cite_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: cite_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(cite);
    			if (default_slot) default_slot.d(detaching);
    			/*cite_binding*/ ctx[28](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(162:26) ",
    		ctx
    	});

    	return block;
    }

    // (151:28) 
    function create_if_block_9(ctx) {
    	let button;
    	let button_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let button_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: button_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$f, 151, 4, 4183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[27](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, button, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, button))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && button_hidden_value !== (button_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: button_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[27](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(151:28) ",
    		ctx
    	});

    	return block;
    }

    // (140:32) 
    function create_if_block_8(ctx) {
    	let blockquote;
    	let blockquote_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let blockquote_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: blockquote_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let blockquote_data = {};

    	for (let i = 0; i < blockquote_levels.length; i += 1) {
    		blockquote_data = assign(blockquote_data, blockquote_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			blockquote = element("blockquote");
    			if (default_slot) default_slot.c();
    			set_attributes(blockquote, blockquote_data);
    			add_location(blockquote, file$f, 140, 4, 3943);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, blockquote, anchor);

    			if (default_slot) {
    				default_slot.m(blockquote, null);
    			}

    			/*blockquote_binding*/ ctx[26](blockquote);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, blockquote, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, blockquote))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(blockquote, blockquote_data = get_spread_update(blockquote_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && blockquote_hidden_value !== (blockquote_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: blockquote_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(blockquote);
    			if (default_slot) default_slot.d(detaching);
    			/*blockquote_binding*/ ctx[26](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(140:32) ",
    		ctx
    	});

    	return block;
    }

    // (129:25) 
    function create_if_block_7(ctx) {
    	let bdo;
    	let bdo_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let bdo_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: bdo_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let bdo_data = {};

    	for (let i = 0; i < bdo_levels.length; i += 1) {
    		bdo_data = assign(bdo_data, bdo_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			bdo = element("bdo");
    			if (default_slot) default_slot.c();
    			set_attributes(bdo, bdo_data);
    			add_location(bdo, file$f, 129, 4, 3713);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bdo, anchor);

    			if (default_slot) {
    				default_slot.m(bdo, null);
    			}

    			/*bdo_binding*/ ctx[25](bdo);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, bdo, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, bdo))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(bdo, bdo_data = get_spread_update(bdo_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && bdo_hidden_value !== (bdo_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: bdo_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bdo);
    			if (default_slot) default_slot.d(detaching);
    			/*bdo_binding*/ ctx[25](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(129:25) ",
    		ctx
    	});

    	return block;
    }

    // (118:25) 
    function create_if_block_6(ctx) {
    	let bdi;
    	let bdi_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let bdi_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: bdi_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let bdi_data = {};

    	for (let i = 0; i < bdi_levels.length; i += 1) {
    		bdi_data = assign(bdi_data, bdi_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			bdi = element("bdi");
    			if (default_slot) default_slot.c();
    			set_attributes(bdi, bdi_data);
    			add_location(bdi, file$f, 118, 4, 3490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, bdi, anchor);

    			if (default_slot) {
    				default_slot.m(bdi, null);
    			}

    			/*bdi_binding*/ ctx[24](bdi);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, bdi, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, bdi))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(bdi, bdi_data = get_spread_update(bdi_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && bdi_hidden_value !== (bdi_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: bdi_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(bdi);
    			if (default_slot) default_slot.d(detaching);
    			/*bdi_binding*/ ctx[24](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(118:25) ",
    		ctx
    	});

    	return block;
    }

    // (107:23) 
    function create_if_block_5(ctx) {
    	let b;
    	let b_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let b_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: b_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let b_data = {};

    	for (let i = 0; i < b_levels.length; i += 1) {
    		b_data = assign(b_data, b_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			b = element("b");
    			if (default_slot) default_slot.c();
    			set_attributes(b, b_data);
    			add_location(b, file$f, 107, 4, 3271);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);

    			if (default_slot) {
    				default_slot.m(b, null);
    			}

    			/*b_binding*/ ctx[23](b);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, b, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, b))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(b, b_data = get_spread_update(b_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && b_hidden_value !== (b_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: b_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    			if (default_slot) default_slot.d(detaching);
    			/*b_binding*/ ctx[23](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(107:23) ",
    		ctx
    	});

    	return block;
    }

    // (96:27) 
    function create_if_block_4(ctx) {
    	let aside;
    	let aside_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let aside_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: aside_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let aside_data = {};

    	for (let i = 0; i < aside_levels.length; i += 1) {
    		aside_data = assign(aside_data, aside_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			if (default_slot) default_slot.c();
    			set_attributes(aside, aside_data);
    			add_location(aside, file$f, 96, 4, 3046);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);

    			if (default_slot) {
    				default_slot.m(aside, null);
    			}

    			/*aside_binding*/ ctx[22](aside);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, aside, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, aside))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(aside, aside_data = get_spread_update(aside_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && aside_hidden_value !== (aside_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: aside_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			if (default_slot) default_slot.d(detaching);
    			/*aside_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(96:27) ",
    		ctx
    	});

    	return block;
    }

    // (85:29) 
    function create_if_block_3$1(ctx) {
    	let article;
    	let article_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let article_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: article_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let article_data = {};

    	for (let i = 0; i < article_levels.length; i += 1) {
    		article_data = assign(article_data, article_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			if (default_slot) default_slot.c();
    			set_attributes(article, article_data);
    			add_location(article, file$f, 85, 4, 2813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);

    			if (default_slot) {
    				default_slot.m(article, null);
    			}

    			/*article_binding*/ ctx[21](article);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, article, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, article))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(article, article_data = get_spread_update(article_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && article_hidden_value !== (article_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: article_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (default_slot) default_slot.d(detaching);
    			/*article_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(85:29) ",
    		ctx
    	});

    	return block;
    }

    // (74:29) 
    function create_if_block_2$1(ctx) {
    	let address;
    	let address_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let address_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: address_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let address_data = {};

    	for (let i = 0; i < address_levels.length; i += 1) {
    		address_data = assign(address_data, address_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			address = element("address");
    			if (default_slot) default_slot.c();
    			set_attributes(address, address_data);
    			add_location(address, file$f, 74, 4, 2578);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, address, anchor);

    			if (default_slot) {
    				default_slot.m(address, null);
    			}

    			/*address_binding*/ ctx[20](address);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, address, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, address))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(address, address_data = get_spread_update(address_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && address_hidden_value !== (address_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: address_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(address);
    			if (default_slot) default_slot.d(detaching);
    			/*address_binding*/ ctx[20](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(74:29) ",
    		ctx
    	});

    	return block;
    }

    // (62:2) {#if as === "a"}
    function create_if_block_1$1(ctx) {
    	let a;
    	let a_hidden_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	let a_levels = [
    		/*$$restProps*/ ctx[7],
    		/*propsWeControl*/ ctx[3],
    		{
    			hidden: a_hidden_value = /*hidden*/ ctx[4] || undefined
    		}
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$f, 63, 4, 2355);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[19](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, a, /*use*/ ctx[2])),
    					action_destroyer(/*forwardEvents*/ ctx[6].call(null, a))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty[0] & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
    				dirty[0] & /*propsWeControl*/ 8 && /*propsWeControl*/ ctx[3],
    				(!current || dirty[0] & /*hidden*/ 16 && a_hidden_value !== (a_hidden_value = /*hidden*/ ctx[4] || undefined)) && { hidden: a_hidden_value }
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[19](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(62:2) {#if as === \\\"a\\\"}",
    		ctx
    	});

    	return block;
    }

    // (492:4) <svelte:component       this={as}       bind:el       use={[...use, forwardEvents]}       {...$$restProps}       {...propsWeControl}       hidden={hidden || undefined}     >
    function create_default_slot$l(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 268435456)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[59],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[59])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$l.name,
    		type: "slot",
    		source: "(492:4) <svelte:component       this={as}       bind:el       use={[...use, forwardEvents]}       {...$$restProps}       {...propsWeControl}       hidden={hidden || undefined}     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*show*/ ctx[5] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*show*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*show*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    var RenderStrategy;

    (function (RenderStrategy) {
    	RenderStrategy[RenderStrategy["Unmount"] = 0] = "Unmount";
    	RenderStrategy[RenderStrategy["Hidden"] = 1] = "Hidden";
    })(RenderStrategy || (RenderStrategy = {}));

    function instance$u($$self, $$props, $$invalidate) {
    	let computedClass;
    	let computedStyle;
    	let show;
    	let hidden;
    	let propsWeControl;

    	const omit_props_names = [
    		"name","as","slotProps","el","use","visible","features","unmount","static","class","style"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Render', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { name } = $$props;
    	let { as } = $$props;
    	let { slotProps } = $$props;
    	let { el = null } = $$props;
    	let { use = [] } = $$props;
    	let { visible = true } = $$props;
    	let { features = Features.None } = $$props;
    	let { unmount = true } = $$props;
    	let { static: static_ = false } = $$props;
    	let { class: classProp = undefined } = $$props;
    	let { style = undefined } = $$props;

    	if (!as) {
    		throw new Error(`<${name}> did not provide an \`as\` value to <Render>`);
    	}

    	if (!isValidElement(as)) {
    		throw new Error(`<${name}> has an invalid or unsupported \`as\` prop: ${as}`);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<Render> was created without expected prop 'name'");
    		}

    		if (as === undefined && !('as' in $$props || $$self.$$.bound[$$self.$$.props['as']])) {
    			console.warn("<Render> was created without expected prop 'as'");
    		}

    		if (slotProps === undefined && !('slotProps' in $$props || $$self.$$.bound[$$self.$$.props['slotProps']])) {
    			console.warn("<Render> was created without expected prop 'slotProps'");
    		}
    	});

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function address_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function article_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function aside_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function b_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function bdi_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function bdo_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function blockquote_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function cite_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function code_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function data_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function datalist_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function dd_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function dl_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function dt_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function em_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function footer_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function form_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function h1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function h2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function h3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function h4_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function h5_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function h6_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function header_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function i_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function label_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function li_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function nav_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function ol_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function p_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function strong_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(0, el);
    		});
    	}

    	function switch_instance_el_binding(value) {
    		el = value;
    		$$invalidate(0, el);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(7, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('name' in $$new_props) $$invalidate(8, name = $$new_props.name);
    		if ('as' in $$new_props) $$invalidate(1, as = $$new_props.as);
    		if ('slotProps' in $$new_props) $$invalidate(9, slotProps = $$new_props.slotProps);
    		if ('el' in $$new_props) $$invalidate(0, el = $$new_props.el);
    		if ('use' in $$new_props) $$invalidate(2, use = $$new_props.use);
    		if ('visible' in $$new_props) $$invalidate(10, visible = $$new_props.visible);
    		if ('features' in $$new_props) $$invalidate(11, features = $$new_props.features);
    		if ('unmount' in $$new_props) $$invalidate(12, unmount = $$new_props.unmount);
    		if ('static' in $$new_props) $$invalidate(13, static_ = $$new_props.static);
    		if ('class' in $$new_props) $$invalidate(14, classProp = $$new_props.class);
    		if ('style' in $$new_props) $$invalidate(15, style = $$new_props.style);
    		if ('$$scope' in $$new_props) $$invalidate(59, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		isValidElement,
    		get_current_component,
    		RenderStrategy,
    		useActions,
    		forwardEventsBuilder,
    		Features,
    		forwardEvents,
    		name,
    		as,
    		slotProps,
    		el,
    		use,
    		visible,
    		features,
    		unmount,
    		static_,
    		classProp,
    		style,
    		propsWeControl,
    		hidden,
    		computedStyle,
    		computedClass,
    		show
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('name' in $$props) $$invalidate(8, name = $$new_props.name);
    		if ('as' in $$props) $$invalidate(1, as = $$new_props.as);
    		if ('slotProps' in $$props) $$invalidate(9, slotProps = $$new_props.slotProps);
    		if ('el' in $$props) $$invalidate(0, el = $$new_props.el);
    		if ('use' in $$props) $$invalidate(2, use = $$new_props.use);
    		if ('visible' in $$props) $$invalidate(10, visible = $$new_props.visible);
    		if ('features' in $$props) $$invalidate(11, features = $$new_props.features);
    		if ('unmount' in $$props) $$invalidate(12, unmount = $$new_props.unmount);
    		if ('static_' in $$props) $$invalidate(13, static_ = $$new_props.static_);
    		if ('classProp' in $$props) $$invalidate(14, classProp = $$new_props.classProp);
    		if ('style' in $$props) $$invalidate(15, style = $$new_props.style);
    		if ('propsWeControl' in $$props) $$invalidate(3, propsWeControl = $$new_props.propsWeControl);
    		if ('hidden' in $$props) $$invalidate(4, hidden = $$new_props.hidden);
    		if ('computedStyle' in $$props) $$invalidate(16, computedStyle = $$new_props.computedStyle);
    		if ('computedClass' in $$props) $$invalidate(17, computedClass = $$new_props.computedClass);
    		if ('show' in $$props) $$invalidate(5, show = $$new_props.show);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*classProp, slotProps*/ 16896) {
    			$$invalidate(17, computedClass = typeof classProp === "function"
    			? classProp(slotProps)
    			: classProp);
    		}

    		if ($$self.$$.dirty[0] & /*style, slotProps*/ 33280) {
    			$$invalidate(16, computedStyle = typeof style === "function" ? style(slotProps) : style);
    		}

    		if ($$self.$$.dirty[0] & /*visible, features, static_, unmount*/ 15360) {
    			$$invalidate(5, show = visible || features & Features.Static && static_ || !(features & Features.RenderStrategy && unmount));
    		}

    		if ($$self.$$.dirty[0] & /*visible, features, static_, unmount*/ 15360) {
    			$$invalidate(4, hidden = !visible && !(features & Features.Static && static_) && features & Features.RenderStrategy && !unmount);
    		}

    		if ($$self.$$.dirty[0] & /*computedClass, computedStyle, hidden*/ 196624) {
    			$$invalidate(3, propsWeControl = {
    				class: computedClass,
    				style: `${computedStyle ?? ""}${hidden ? " display: none" : ""}` || undefined
    			});
    		}

    		if ($$self.$$.dirty[0] & /*propsWeControl*/ 8) {
    			if (propsWeControl.style === undefined) {
    				delete propsWeControl.style;
    			}
    		}
    	};

    	return [
    		el,
    		as,
    		use,
    		propsWeControl,
    		hidden,
    		show,
    		forwardEvents,
    		$$restProps,
    		name,
    		slotProps,
    		visible,
    		features,
    		unmount,
    		static_,
    		classProp,
    		style,
    		computedStyle,
    		computedClass,
    		slots,
    		a_binding,
    		address_binding,
    		article_binding,
    		aside_binding,
    		b_binding,
    		bdi_binding,
    		bdo_binding,
    		blockquote_binding,
    		button_binding,
    		cite_binding,
    		code_binding,
    		data_binding,
    		datalist_binding,
    		dd_binding,
    		dl_binding,
    		dt_binding,
    		div_binding,
    		em_binding,
    		footer_binding,
    		form_binding,
    		h1_binding,
    		h2_binding,
    		h3_binding,
    		h4_binding,
    		h5_binding,
    		h6_binding,
    		header_binding,
    		i_binding,
    		input_binding,
    		label_binding,
    		li_binding,
    		main_binding,
    		nav_binding,
    		ol_binding,
    		p_binding,
    		section_binding,
    		span_binding,
    		strong_binding,
    		ul_binding,
    		switch_instance_el_binding,
    		$$scope
    	];
    }

    class Render extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$2(
    			this,
    			options,
    			instance$u,
    			create_fragment$u,
    			safe_not_equal,
    			{
    				name: 8,
    				as: 1,
    				slotProps: 9,
    				el: 0,
    				use: 2,
    				visible: 10,
    				features: 11,
    				unmount: 12,
    				static: 13,
    				class: 14,
    				style: 15
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Render",
    			options,
    			id: create_fragment$u.name
    		});
    	}

    	get name() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get as() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slotProps() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slotProps(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get el() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set el(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get features() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set features(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unmount() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unmount(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get static() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set static(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error_1$2("<Render>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error_1$2("<Render>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\dialog\Dialog.svelte generated by Svelte v3.55.0 */

    var DialogStates;

    (function (DialogStates) {
    	DialogStates[DialogStates["Open"] = 0] = "Open";
    	DialogStates[DialogStates["Closed"] = 1] = "Closed";
    })(DialogStates || (DialogStates = {}));

    /* node_modules\@rgossiaux\svelte-headlessui\components\disclosure\Disclosure.svelte generated by Svelte v3.55.0 */

    var DisclosureStates;

    (function (DisclosureStates) {
    	DisclosureStates[DisclosureStates["Open"] = 0] = "Open";
    	DisclosureStates[DisclosureStates["Closed"] = 1] = "Closed";
    })(DisclosureStates || (DisclosureStates = {}));

    function resolveButtonType(props, ref) {
        if (props.type)
            return props.type;
        let tag = props.as ?? "button";
        if (typeof tag === "string" && tag.toLowerCase() === "button")
            return "button";
        if (ref && ref instanceof HTMLButtonElement)
            return "button";
        return undefined;
    }

    function assertNever(x) {
        throw new Error("Unexpected object: " + x);
    }
    var Focus;
    (function (Focus) {
        /** Focus the first non-disabled item. */
        Focus[Focus["First"] = 0] = "First";
        /** Focus the previous non-disabled item. */
        Focus[Focus["Previous"] = 1] = "Previous";
        /** Focus the next non-disabled item. */
        Focus[Focus["Next"] = 2] = "Next";
        /** Focus the last non-disabled item. */
        Focus[Focus["Last"] = 3] = "Last";
        /** Focus a specific item based on the `id` of the item. */
        Focus[Focus["Specific"] = 4] = "Specific";
        /** Focus no items at all. */
        Focus[Focus["Nothing"] = 5] = "Nothing";
    })(Focus || (Focus = {}));
    function calculateActiveIndex(action, resolvers) {
        let items = resolvers.resolveItems();
        if (items.length <= 0)
            return null;
        let currentActiveIndex = resolvers.resolveActiveIndex();
        let activeIndex = currentActiveIndex ?? -1;
        let nextActiveIndex = (() => {
            switch (action.focus) {
                case Focus.First:
                    return items.findIndex((item) => !resolvers.resolveDisabled(item));
                case Focus.Previous: {
                    let idx = items
                        .slice()
                        .reverse()
                        .findIndex((item, idx, all) => {
                        if (activeIndex !== -1 && all.length - idx - 1 >= activeIndex)
                            return false;
                        return !resolvers.resolveDisabled(item);
                    });
                    if (idx === -1)
                        return idx;
                    return items.length - 1 - idx;
                }
                case Focus.Next:
                    return items.findIndex((item, idx) => {
                        if (idx <= activeIndex)
                            return false;
                        return !resolvers.resolveDisabled(item);
                    });
                case Focus.Last: {
                    let idx = items
                        .slice()
                        .reverse()
                        .findIndex((item) => !resolvers.resolveDisabled(item));
                    if (idx === -1)
                        return idx;
                    return items.length - 1 - idx;
                }
                case Focus.Specific:
                    return items.findIndex((item) => resolvers.resolveId(item) === action.id);
                case Focus.Nothing:
                    return null;
                default:
                    assertNever(action);
            }
        })();
        return nextActiveIndex === -1 ? currentActiveIndex : nextActiveIndex;
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\listbox\Listbox.svelte generated by Svelte v3.55.0 */

    const { Error: Error_1$1 } = globals;
    const get_default_slot_spread_changes$8 = dirty => dirty & /*slotProps*/ 4;
    const get_default_slot_changes$8 = dirty => ({});
    const get_default_slot_context$8 = ctx => ({ .../*slotProps*/ ctx[2] });

    // (193:0) <Render   {...$$restProps}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={"Listbox"} >
    function create_default_slot$k(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context$8);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, slotProps*/ 262148)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						get_default_slot_spread_changes$8(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes$8),
    						get_default_slot_context$8
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$k.name,
    		type: "slot",
    		source: "(193:0) <Render   {...$$restProps}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={\\\"Listbox\\\"} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let render;
    	let current;
    	let mounted;
    	let dispose;

    	const render_spread_levels = [
    		/*$$restProps*/ ctx[8],
    		{ as: /*as*/ ctx[0] },
    		{ slotProps: /*slotProps*/ ctx[2] },
    		{
    			use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[3]]
    		},
    		{ name: "Listbox" }
    	];

    	let render_props = {
    		$$slots: { default: [create_default_slot$k] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < render_spread_levels.length; i += 1) {
    		render_props = assign(render_props, render_spread_levels[i]);
    	}

    	render = new Render({ props: render_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(render.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(render, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "mousedown", /*handleMousedown*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const render_changes = (dirty & /*$$restProps, as, slotProps, use, forwardEvents*/ 271)
    			? get_spread_update(render_spread_levels, [
    					dirty & /*$$restProps*/ 256 && get_spread_object(/*$$restProps*/ ctx[8]),
    					dirty & /*as*/ 1 && { as: /*as*/ ctx[0] },
    					dirty & /*slotProps*/ 4 && { slotProps: /*slotProps*/ ctx[2] },
    					dirty & /*use, forwardEvents*/ 10 && {
    						use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[3]]
    					},
    					render_spread_levels[4]
    				])
    			: {};

    			if (dirty & /*$$scope, slotProps*/ 262148) {
    				render_changes.$$scope = { dirty, ctx };
    			}

    			render.$set(render_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(render.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(render.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(render, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    var ListboxStates;

    (function (ListboxStates) {
    	ListboxStates[ListboxStates["Open"] = 0] = "Open";
    	ListboxStates[ListboxStates["Closed"] = 1] = "Closed";
    })(ListboxStates || (ListboxStates = {}));

    const LISTBOX_CONTEXT_NAME = "headlessui-listbox-context";

    function useListboxContext(component) {
    	let context = getContext(LISTBOX_CONTEXT_NAME);

    	if (context === undefined) {
    		throw new Error(`<${component} /> is missing a parent <Listbox /> component.`);
    	}

    	return context;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let orientation;
    	let slotProps;
    	const omit_props_names = ["as","use","disabled","horizontal","value"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $buttonRef;
    	let $api;
    	let $optionsRef;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Listbox', slots, ['default']);
    	let { as = "div" } = $$props;
    	let { use = [] } = $$props;
    	let { disabled = false } = $$props;
    	let { horizontal = false } = $$props;
    	let { value } = $$props;

    	/***** Events *****/
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ["change"]);

    	const dispatch = createEventDispatcher();
    	let listboxState = ListboxStates.Closed;
    	let labelRef = writable(null);
    	let buttonRef = writable(null);
    	validate_store(buttonRef, 'buttonRef');
    	component_subscribe($$self, buttonRef, value => $$invalidate(19, $buttonRef = value));
    	let optionsRef = writable(null);
    	validate_store(optionsRef, 'optionsRef');
    	component_subscribe($$self, optionsRef, value => $$invalidate(21, $optionsRef = value));
    	let options = [];
    	let searchQuery = "";
    	let activeOptionIndex = null;

    	let api = writable({
    		listboxState,
    		value,
    		labelRef,
    		buttonRef,
    		optionsRef,
    		options,
    		searchQuery,
    		activeOptionIndex,
    		disabled,
    		orientation,
    		closeListbox() {
    			if (disabled) return;
    			if (listboxState === ListboxStates.Closed) return;
    			$$invalidate(12, listboxState = ListboxStates.Closed);
    			$$invalidate(15, activeOptionIndex = null);
    		},
    		openListbox() {
    			if (disabled) return;
    			if (listboxState === ListboxStates.Open) return;
    			$$invalidate(12, listboxState = ListboxStates.Open);
    		},
    		goToOption(focus, id) {
    			if (disabled) return;
    			if (listboxState === ListboxStates.Closed) return;

    			let nextActiveOptionIndex = calculateActiveIndex(
    				focus === Focus.Specific
    				? { focus: Focus.Specific, id }
    				: { focus },
    				{
    					resolveItems: () => options,
    					resolveActiveIndex: () => activeOptionIndex,
    					resolveId: option => option.id,
    					resolveDisabled: option => option.dataRef.disabled
    				}
    			);

    			if (searchQuery === "" && activeOptionIndex === nextActiveOptionIndex) return;
    			$$invalidate(15, activeOptionIndex = nextActiveOptionIndex);
    			$$invalidate(14, searchQuery = "");
    		},
    		search(value) {
    			if (disabled) return;
    			if (listboxState === ListboxStates.Closed) return;
    			$$invalidate(14, searchQuery += value.toLowerCase());

    			let reorderedOptions = activeOptionIndex !== null
    			? options.slice(activeOptionIndex + 1).concat(options.slice(0, activeOptionIndex + 1))
    			: options;

    			let matchingOption = reorderedOptions.find(option => !option.dataRef.disabled && option.dataRef.textValue.startsWith(searchQuery));
    			let matchIdx = matchingOption ? options.indexOf(matchingOption) : -1;
    			if (matchIdx === -1 || matchIdx === activeOptionIndex) return;
    			$$invalidate(15, activeOptionIndex = matchIdx);
    		},
    		clearSearch() {
    			if (disabled) return;
    			if (listboxState === ListboxStates.Closed) return;
    			if (searchQuery === "") return;
    			$$invalidate(14, searchQuery = "");
    		},
    		registerOption(id, dataRef) {
    			if (!$optionsRef) {
    				// We haven't mounted yet so just append
    				$$invalidate(13, options = [...options, { id, dataRef }]);

    				return;
    			}

    			let currentActiveOption = activeOptionIndex !== null
    			? options[activeOptionIndex]
    			: null;

    			let orderMap = Array.from($optionsRef.querySelectorAll('[id^="headlessui-listbox-option-"]')).reduce((lookup, element, index) => Object.assign(lookup, { [element.id]: index }), {});
    			let nextOptions = [...options, { id, dataRef }];
    			nextOptions.sort((a, z) => orderMap[a.id] - orderMap[z.id]);
    			$$invalidate(13, options = nextOptions);

    			// Maintain the correct item active
    			$$invalidate(15, activeOptionIndex = (() => {
    				if (currentActiveOption === null) return null;
    				return options.indexOf(currentActiveOption);
    			})());
    		},
    		unregisterOption(id) {
    			let nextOptions = options.slice();

    			let currentActiveOption = activeOptionIndex !== null
    			? nextOptions[activeOptionIndex]
    			: null;

    			let idx = nextOptions.findIndex(a => a.id === id);
    			if (idx !== -1) nextOptions.splice(idx, 1);
    			$$invalidate(13, options = nextOptions);

    			$$invalidate(15, activeOptionIndex = (() => {
    				if (idx === activeOptionIndex) return null;
    				if (currentActiveOption === null) return null;

    				// If we removed the option before the actual active index, then it would be out of sync. To
    				// fix this, we will find the correct (new) index position.
    				return nextOptions.indexOf(currentActiveOption);
    			})());
    		},
    		select(value) {
    			if (disabled) return;
    			dispatch("change", value);
    		}
    	});

    	validate_store(api, 'api');
    	component_subscribe($$self, api, value => $$invalidate(20, $api = value));
    	setContext(LISTBOX_CONTEXT_NAME, api);
    	let openClosedState = writable(State.Closed);
    	useOpenClosedProvider(openClosedState);

    	function handleMousedown(event) {
    		let target = event.target;
    		let active = document.activeElement;
    		if (listboxState !== ListboxStates.Open) return;
    		if ($buttonRef?.contains(target)) return;
    		if (!$optionsRef?.contains(target)) $api.closeListbox();
    		if (active !== document.body && active?.contains(target)) return; // Keep focus on newly clicked/focused element

    		if (!event.defaultPrevented) {
    			$buttonRef?.focus({ preventScroll: true });
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<Listbox> was created without expected prop 'value'");
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('disabled' in $$new_props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ('horizontal' in $$new_props) $$invalidate(10, horizontal = $$new_props.horizontal);
    		if ('value' in $$new_props) $$invalidate(11, value = $$new_props.value);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ListboxStates,
    		LISTBOX_CONTEXT_NAME,
    		useListboxContext,
    		Focus,
    		calculateActiveIndex,
    		createEventDispatcher,
    		getContext,
    		setContext,
    		writable,
    		match,
    		State,
    		useOpenClosedProvider,
    		forwardEventsBuilder,
    		get_current_component,
    		Render,
    		as,
    		use,
    		disabled,
    		horizontal,
    		value,
    		forwardEvents,
    		dispatch,
    		listboxState,
    		labelRef,
    		buttonRef,
    		optionsRef,
    		options,
    		searchQuery,
    		activeOptionIndex,
    		api,
    		openClosedState,
    		handleMousedown,
    		slotProps,
    		orientation,
    		$buttonRef,
    		$api,
    		$optionsRef
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('disabled' in $$props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ('horizontal' in $$props) $$invalidate(10, horizontal = $$new_props.horizontal);
    		if ('value' in $$props) $$invalidate(11, value = $$new_props.value);
    		if ('listboxState' in $$props) $$invalidate(12, listboxState = $$new_props.listboxState);
    		if ('labelRef' in $$props) labelRef = $$new_props.labelRef;
    		if ('buttonRef' in $$props) $$invalidate(4, buttonRef = $$new_props.buttonRef);
    		if ('optionsRef' in $$props) $$invalidate(5, optionsRef = $$new_props.optionsRef);
    		if ('options' in $$props) $$invalidate(13, options = $$new_props.options);
    		if ('searchQuery' in $$props) $$invalidate(14, searchQuery = $$new_props.searchQuery);
    		if ('activeOptionIndex' in $$props) $$invalidate(15, activeOptionIndex = $$new_props.activeOptionIndex);
    		if ('api' in $$props) $$invalidate(6, api = $$new_props.api);
    		if ('openClosedState' in $$props) $$invalidate(24, openClosedState = $$new_props.openClosedState);
    		if ('slotProps' in $$props) $$invalidate(2, slotProps = $$new_props.slotProps);
    		if ('orientation' in $$props) $$invalidate(16, orientation = $$new_props.orientation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*horizontal*/ 1024) {
    			/***** Component *****/
    			$$invalidate(16, orientation = horizontal ? "horizontal" : "vertical");
    		}

    		if ($$self.$$.dirty & /*listboxState*/ 4096) {
    			openClosedState.set(match(listboxState, {
    				[ListboxStates.Open]: State.Open,
    				[ListboxStates.Closed]: State.Closed
    			}));
    		}

    		if ($$self.$$.dirty & /*listboxState, value, options, searchQuery, activeOptionIndex, disabled, orientation*/ 129536) {
    			api.update(obj => {
    				return {
    					...obj,
    					listboxState,
    					value,
    					options,
    					searchQuery,
    					activeOptionIndex,
    					disabled,
    					orientation
    				};
    			});
    		}

    		if ($$self.$$.dirty & /*listboxState*/ 4096) {
    			$$invalidate(2, slotProps = {
    				open: listboxState === ListboxStates.Open
    			});
    		}
    	};

    	return [
    		as,
    		use,
    		slotProps,
    		forwardEvents,
    		buttonRef,
    		optionsRef,
    		api,
    		handleMousedown,
    		$$restProps,
    		disabled,
    		horizontal,
    		value,
    		listboxState,
    		options,
    		searchQuery,
    		activeOptionIndex,
    		orientation,
    		slots,
    		$$scope
    	];
    }

    class Listbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$2(this, options, instance$t, create_fragment$t, safe_not_equal, {
    			as: 0,
    			use: 1,
    			disabled: 9,
    			horizontal: 10,
    			value: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Listbox",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get as() {
    		throw new Error_1$1("<Listbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error_1$1("<Listbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error_1$1("<Listbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error_1$1("<Listbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error_1$1("<Listbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error_1$1("<Listbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get horizontal() {
    		throw new Error_1$1("<Listbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set horizontal(value) {
    		throw new Error_1$1("<Listbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error_1$1("<Listbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error_1$1("<Listbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\listbox\ListboxButton.svelte generated by Svelte v3.55.0 */
    const get_default_slot_spread_changes$7 = dirty => dirty & /*slotProps*/ 8;
    const get_default_slot_changes$7 = dirty => ({});
    const get_default_slot_context$7 = ctx => ({ .../*slotProps*/ ctx[3] });

    // (91:0) <Render   {...$$restProps}   {...propsWeControl}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={"ListboxButton"}   bind:el={$buttonRef}   on:click={handleClick}   on:keydown={handleKeyDown}   on:keyup={handleKeyUp} >
    function create_default_slot$j(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], get_default_slot_context$7);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, slotProps*/ 524296)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						get_default_slot_spread_changes$7(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, get_default_slot_changes$7),
    						get_default_slot_context$7
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$j.name,
    		type: "slot",
    		source: "(91:0) <Render   {...$$restProps}   {...propsWeControl}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={\\\"ListboxButton\\\"}   bind:el={$buttonRef}   on:click={handleClick}   on:keydown={handleKeyDown}   on:keyup={handleKeyUp} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let render;
    	let updating_el;
    	let current;

    	const render_spread_levels = [
    		/*$$restProps*/ ctx[13],
    		/*propsWeControl*/ ctx[4],
    		{ as: /*as*/ ctx[0] },
    		{ slotProps: /*slotProps*/ ctx[3] },
    		{
    			use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[5]]
    		},
    		{ name: "ListboxButton" }
    	];

    	function render_el_binding(value) {
    		/*render_el_binding*/ ctx[18](value);
    	}

    	let render_props = {
    		$$slots: { default: [create_default_slot$j] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < render_spread_levels.length; i += 1) {
    		render_props = assign(render_props, render_spread_levels[i]);
    	}

    	if (/*$buttonRef*/ ctx[2] !== void 0) {
    		render_props.el = /*$buttonRef*/ ctx[2];
    	}

    	render = new Render({ props: render_props, $$inline: true });
    	binding_callbacks.push(() => bind(render, 'el', render_el_binding, /*$buttonRef*/ ctx[2]));
    	render.$on("click", /*handleClick*/ ctx[12]);
    	render.$on("keydown", /*handleKeyDown*/ ctx[10]);
    	render.$on("keyup", /*handleKeyUp*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(render.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(render, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const render_changes = (dirty & /*$$restProps, propsWeControl, as, slotProps, use, forwardEvents*/ 8251)
    			? get_spread_update(render_spread_levels, [
    					dirty & /*$$restProps*/ 8192 && get_spread_object(/*$$restProps*/ ctx[13]),
    					dirty & /*propsWeControl*/ 16 && get_spread_object(/*propsWeControl*/ ctx[4]),
    					dirty & /*as*/ 1 && { as: /*as*/ ctx[0] },
    					dirty & /*slotProps*/ 8 && { slotProps: /*slotProps*/ ctx[3] },
    					dirty & /*use, forwardEvents*/ 34 && {
    						use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[5]]
    					},
    					render_spread_levels[5]
    				])
    			: {};

    			if (dirty & /*$$scope, slotProps*/ 524296) {
    				render_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_el && dirty & /*$buttonRef*/ 4) {
    				updating_el = true;
    				render_changes.el = /*$buttonRef*/ ctx[2];
    				add_flush_callback(() => updating_el = false);
    			}

    			render.$set(render_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(render.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(render.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(render, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let propsWeControl;
    	let slotProps;
    	const omit_props_names = ["as","use"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $api;
    	let $labelRef;
    	let $optionsRef;
    	let $buttonRef;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListboxButton', slots, ['default']);
    	let { as = "button" } = $$props;
    	let { use = [] } = $$props;

    	/***** Events *****/
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	/***** Component *****/
    	let api = useListboxContext("ListboxButton");

    	validate_store(api, 'api');
    	component_subscribe($$self, api, value => $$invalidate(14, $api = value));
    	let id = `headlessui-listbox-button-${useId()}`;
    	let buttonRef = $api.buttonRef;
    	validate_store(buttonRef, 'buttonRef');
    	component_subscribe($$self, buttonRef, value => $$invalidate(2, $buttonRef = value));
    	let optionsRef = $api.optionsRef;
    	validate_store(optionsRef, 'optionsRef');
    	component_subscribe($$self, optionsRef, value => $$invalidate(16, $optionsRef = value));
    	let labelRef = $api.labelRef;
    	validate_store(labelRef, 'labelRef');
    	component_subscribe($$self, labelRef, value => $$invalidate(15, $labelRef = value));

    	async function handleKeyDown(e) {
    		let event = e;

    		switch (event.key) {
    			case Keys.Space:
    			case Keys.Enter:
    			case Keys.ArrowDown:
    				event.preventDefault();
    				$api.openListbox();
    				await tick();
    				$optionsRef?.focus({ preventScroll: true });
    				if (!$api.value) $api.goToOption(Focus.First);
    				break;
    			case Keys.ArrowUp:
    				event.preventDefault();
    				$api.openListbox();
    				await tick();
    				$optionsRef?.focus({ preventScroll: true });
    				if (!$api.value) $api.goToOption(Focus.Last);
    				break;
    		}
    	}

    	function handleKeyUp(e) {
    		let event = e;

    		switch (event.key) {
    			case Keys.Space:
    				// Required for firefox, event.preventDefault() in handleKeyDown for
    				// the Space key doesn't cancel the handleKeyUp, which in turn
    				// triggers a *click*.
    				event.preventDefault();
    				break;
    		}
    	}

    	async function handleClick(e) {
    		let event = e;
    		if ($api.disabled) return;

    		if ($api.listboxState === ListboxStates.Open) {
    			$api.closeListbox();
    			await tick();
    			$buttonRef?.focus({ preventScroll: true });
    		} else {
    			event.preventDefault();
    			$api.openListbox();
    			await tick();
    			$optionsRef?.focus({ preventScroll: true });
    		}
    	}

    	function render_el_binding(value) {
    		$buttonRef = value;
    		buttonRef.set($buttonRef);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(21, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(13, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		ListboxStates,
    		useListboxContext,
    		useId,
    		Keys,
    		Focus,
    		forwardEventsBuilder,
    		get_current_component,
    		Render,
    		resolveButtonType,
    		as,
    		use,
    		forwardEvents,
    		api,
    		id,
    		buttonRef,
    		optionsRef,
    		labelRef,
    		handleKeyDown,
    		handleKeyUp,
    		handleClick,
    		slotProps,
    		propsWeControl,
    		$api,
    		$labelRef,
    		$optionsRef,
    		$buttonRef
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(21, $$props = assign(assign({}, $$props), $$new_props));
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('api' in $$props) $$invalidate(6, api = $$new_props.api);
    		if ('id' in $$props) $$invalidate(20, id = $$new_props.id);
    		if ('buttonRef' in $$props) $$invalidate(7, buttonRef = $$new_props.buttonRef);
    		if ('optionsRef' in $$props) $$invalidate(8, optionsRef = $$new_props.optionsRef);
    		if ('labelRef' in $$props) $$invalidate(9, labelRef = $$new_props.labelRef);
    		if ('slotProps' in $$props) $$invalidate(3, slotProps = $$new_props.slotProps);
    		if ('propsWeControl' in $$props) $$invalidate(4, propsWeControl = $$new_props.propsWeControl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(4, propsWeControl = {
    			id,
    			type: resolveButtonType({ type: $$props.type, as }, $buttonRef),
    			"aria-haspopup": true,
    			"aria-controls": $optionsRef?.id,
    			"aria-expanded": $api.disabled
    			? undefined
    			: $api.listboxState === ListboxStates.Open,
    			"aria-labelledby": $labelRef ? [$labelRef?.id, id].join(" ") : undefined,
    			disabled: $api.disabled === true ? true : undefined
    		});

    		if ($$self.$$.dirty & /*$api*/ 16384) {
    			$$invalidate(3, slotProps = {
    				open: $api.listboxState === ListboxStates.Open,
    				disabled: $api.disabled
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		as,
    		use,
    		$buttonRef,
    		slotProps,
    		propsWeControl,
    		forwardEvents,
    		api,
    		buttonRef,
    		optionsRef,
    		labelRef,
    		handleKeyDown,
    		handleKeyUp,
    		handleClick,
    		$$restProps,
    		$api,
    		$labelRef,
    		$optionsRef,
    		slots,
    		render_el_binding,
    		$$scope
    	];
    }

    class ListboxButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$s, create_fragment$s, safe_not_equal, { as: 0, use: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListboxButton",
    			options,
    			id: create_fragment$s.name
    		});
    	}

    	get as() {
    		throw new Error("<ListboxButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<ListboxButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<ListboxButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<ListboxButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\listbox\ListboxOptions.svelte generated by Svelte v3.55.0 */
    const get_default_slot_spread_changes$6 = dirty => dirty & /*slotProps*/ 4;
    const get_default_slot_changes$6 = dirty => ({});
    const get_default_slot_context$6 = ctx => ({ .../*slotProps*/ ctx[2] });

    // (111:0) <Render   {...$$restProps}   {...propsWeControl}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={"ListboxOptions"}   bind:el={$optionsRef}   on:keydown={handleKeyDown}   {visible}   features={Features.RenderStrategy | Features.Static} >
    function create_default_slot$i(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], get_default_slot_context$6);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, slotProps*/ 1048580)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[20],
    						get_default_slot_spread_changes$6(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[20])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[20], dirty, get_default_slot_changes$6),
    						get_default_slot_context$6
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$i.name,
    		type: "slot",
    		source: "(111:0) <Render   {...$$restProps}   {...propsWeControl}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={\\\"ListboxOptions\\\"}   bind:el={$optionsRef}   on:keydown={handleKeyDown}   {visible}   features={Features.RenderStrategy | Features.Static} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let render;
    	let updating_el;
    	let current;

    	const render_spread_levels = [
    		/*$$restProps*/ ctx[13],
    		/*propsWeControl*/ ctx[4],
    		{ as: /*as*/ ctx[0] },
    		{ slotProps: /*slotProps*/ ctx[2] },
    		{
    			use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[6]]
    		},
    		{ name: "ListboxOptions" },
    		{ visible: /*visible*/ ctx[3] },
    		{
    			features: Features.RenderStrategy | Features.Static
    		}
    	];

    	function render_el_binding(value) {
    		/*render_el_binding*/ ctx[19](value);
    	}

    	let render_props = {
    		$$slots: { default: [create_default_slot$i] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < render_spread_levels.length; i += 1) {
    		render_props = assign(render_props, render_spread_levels[i]);
    	}

    	if (/*$optionsRef*/ ctx[5] !== void 0) {
    		render_props.el = /*$optionsRef*/ ctx[5];
    	}

    	render = new Render({ props: render_props, $$inline: true });
    	binding_callbacks.push(() => bind(render, 'el', render_el_binding, /*$optionsRef*/ ctx[5]));
    	render.$on("keydown", /*handleKeyDown*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(render.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(render, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const render_changes = (dirty & /*$$restProps, propsWeControl, as, slotProps, use, forwardEvents, visible, Features*/ 8287)
    			? get_spread_update(render_spread_levels, [
    					dirty & /*$$restProps*/ 8192 && get_spread_object(/*$$restProps*/ ctx[13]),
    					dirty & /*propsWeControl*/ 16 && get_spread_object(/*propsWeControl*/ ctx[4]),
    					dirty & /*as*/ 1 && { as: /*as*/ ctx[0] },
    					dirty & /*slotProps*/ 4 && { slotProps: /*slotProps*/ ctx[2] },
    					dirty & /*use, forwardEvents*/ 66 && {
    						use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[6]]
    					},
    					render_spread_levels[5],
    					dirty & /*visible*/ 8 && { visible: /*visible*/ ctx[3] },
    					dirty & /*Features*/ 0 && {
    						features: Features.RenderStrategy | Features.Static
    					}
    				])
    			: {};

    			if (dirty & /*$$scope, slotProps*/ 1048580) {
    				render_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_el && dirty & /*$optionsRef*/ 32) {
    				updating_el = true;
    				render_changes.el = /*$optionsRef*/ ctx[5];
    				add_flush_callback(() => updating_el = false);
    			}

    			render.$set(render_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(render.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(render.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(render, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let propsWeControl;
    	let visible;
    	let slotProps;
    	const omit_props_names = ["as","use"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $api;
    	let $usesOpenClosedState;
    	let $buttonRef;
    	let $labelRef;
    	let $optionsRef;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListboxOptions', slots, ['default']);
    	let { as = "ul" } = $$props;
    	let { use = [] } = $$props;

    	/***** Events *****/
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	/***** Component *****/
    	let api = useListboxContext("ListboxOptions");

    	validate_store(api, 'api');
    	component_subscribe($$self, api, value => $$invalidate(14, $api = value));
    	let id = `headlessui-listbox-options-${useId()}`;
    	let optionsRef = $api.optionsRef;
    	validate_store(optionsRef, 'optionsRef');
    	component_subscribe($$self, optionsRef, value => $$invalidate(5, $optionsRef = value));
    	let buttonRef = $api.buttonRef;
    	validate_store(buttonRef, 'buttonRef');
    	component_subscribe($$self, buttonRef, value => $$invalidate(16, $buttonRef = value));
    	let labelRef = $api.labelRef;
    	validate_store(labelRef, 'labelRef');
    	component_subscribe($$self, labelRef, value => $$invalidate(17, $labelRef = value));
    	let searchDebounce = null;

    	async function handleKeyDown(e) {
    		let event = e;
    		if (searchDebounce) clearTimeout(searchDebounce);

    		switch (event.key) {
    			case Keys.Space:
    				if ($api.searchQuery !== "") {
    					event.preventDefault();
    					event.stopPropagation();
    					return $api.search(event.key);
    				}
    			case Keys.Enter:
    				event.preventDefault();
    				event.stopPropagation();
    				if ($api.activeOptionIndex !== null) {
    					let { dataRef } = $api.options[$api.activeOptionIndex];
    					$api.select(dataRef.value);
    				}
    				$api.closeListbox();
    				await tick();
    				$buttonRef?.focus({ preventScroll: true });
    				break;
    			case match($api.orientation, {
    				vertical: Keys.ArrowDown,
    				horizontal: Keys.ArrowRight
    			}):
    				event.preventDefault();
    				event.stopPropagation();
    				return $api.goToOption(Focus.Next);
    			case match($api.orientation, {
    				vertical: Keys.ArrowUp,
    				horizontal: Keys.ArrowLeft
    			}):
    				event.preventDefault();
    				event.stopPropagation();
    				return $api.goToOption(Focus.Previous);
    			case Keys.Home:
    			case Keys.PageUp:
    				event.preventDefault();
    				event.stopPropagation();
    				return $api.goToOption(Focus.First);
    			case Keys.End:
    			case Keys.PageDown:
    				event.preventDefault();
    				event.stopPropagation();
    				return $api.goToOption(Focus.Last);
    			case Keys.Escape:
    				event.preventDefault();
    				event.stopPropagation();
    				$api.closeListbox();
    				await tick();
    				$buttonRef?.focus({ preventScroll: true });
    				break;
    			case Keys.Tab:
    				event.preventDefault();
    				event.stopPropagation();
    				break;
    			default:
    				if (event.key.length === 1) {
    					$api.search(event.key);
    					searchDebounce = setTimeout(() => $api.clearSearch(), 350);
    				}
    				break;
    		}
    	}

    	let usesOpenClosedState = useOpenClosed();
    	validate_store(usesOpenClosedState, 'usesOpenClosedState');
    	component_subscribe($$self, usesOpenClosedState, value => $$invalidate(15, $usesOpenClosedState = value));

    	function render_el_binding(value) {
    		$optionsRef = value;
    		optionsRef.set($optionsRef);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(13, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(20, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		ListboxStates,
    		useListboxContext,
    		useId,
    		match,
    		Keys,
    		Focus,
    		State,
    		useOpenClosed,
    		Render,
    		forwardEventsBuilder,
    		get_current_component,
    		Features,
    		as,
    		use,
    		forwardEvents,
    		api,
    		id,
    		optionsRef,
    		buttonRef,
    		labelRef,
    		searchDebounce,
    		handleKeyDown,
    		usesOpenClosedState,
    		slotProps,
    		visible,
    		propsWeControl,
    		$api,
    		$usesOpenClosedState,
    		$buttonRef,
    		$labelRef,
    		$optionsRef
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('api' in $$props) $$invalidate(7, api = $$new_props.api);
    		if ('id' in $$props) $$invalidate(22, id = $$new_props.id);
    		if ('optionsRef' in $$props) $$invalidate(8, optionsRef = $$new_props.optionsRef);
    		if ('buttonRef' in $$props) $$invalidate(9, buttonRef = $$new_props.buttonRef);
    		if ('labelRef' in $$props) $$invalidate(10, labelRef = $$new_props.labelRef);
    		if ('searchDebounce' in $$props) searchDebounce = $$new_props.searchDebounce;
    		if ('usesOpenClosedState' in $$props) $$invalidate(12, usesOpenClosedState = $$new_props.usesOpenClosedState);
    		if ('slotProps' in $$props) $$invalidate(2, slotProps = $$new_props.slotProps);
    		if ('visible' in $$props) $$invalidate(3, visible = $$new_props.visible);
    		if ('propsWeControl' in $$props) $$invalidate(4, propsWeControl = $$new_props.propsWeControl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$api, $labelRef, $buttonRef*/ 212992) {
    			$$invalidate(4, propsWeControl = {
    				"aria-activedescendant": $api.activeOptionIndex === null
    				? undefined
    				: $api.options[$api.activeOptionIndex]?.id,
    				"aria-labelledby": $labelRef?.id ?? $buttonRef?.id,
    				"aria-orientation": $api.orientation,
    				id,
    				role: "listbox",
    				tabIndex: 0
    			});
    		}

    		if ($$self.$$.dirty & /*$usesOpenClosedState, $api*/ 49152) {
    			$$invalidate(3, visible = usesOpenClosedState !== undefined
    			? $usesOpenClosedState === State.Open
    			: $api.listboxState === ListboxStates.Open);
    		}

    		if ($$self.$$.dirty & /*$api*/ 16384) {
    			$$invalidate(2, slotProps = {
    				open: $api.listboxState === ListboxStates.Open
    			});
    		}
    	};

    	return [
    		as,
    		use,
    		slotProps,
    		visible,
    		propsWeControl,
    		$optionsRef,
    		forwardEvents,
    		api,
    		optionsRef,
    		buttonRef,
    		labelRef,
    		handleKeyDown,
    		usesOpenClosedState,
    		$$restProps,
    		$api,
    		$usesOpenClosedState,
    		$buttonRef,
    		$labelRef,
    		slots,
    		render_el_binding,
    		$$scope
    	];
    }

    class ListboxOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$r, create_fragment$r, safe_not_equal, { as: 0, use: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListboxOptions",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get as() {
    		throw new Error("<ListboxOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<ListboxOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<ListboxOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<ListboxOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\listbox\ListboxOption.svelte generated by Svelte v3.55.0 */
    const get_default_slot_spread_changes$5 = dirty => dirty & /*slotProps*/ 4;
    const get_default_slot_changes$5 = dirty => ({});
    const get_default_slot_context$5 = ctx => ({ .../*slotProps*/ ctx[2] });

    // (100:0) <Render   {...$$restProps}   {...propsWeControl}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={"ListboxOption"}   on:click={handleClick}   on:focus={handleFocus}   on:pointermove={handleMove}   on:mousemove={handleMove}   on:pointerleave={handleLeave}   on:mouseleave={handleLeave} >
    function create_default_slot$h(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context$5);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, slotProps*/ 262148)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						get_default_slot_spread_changes$5(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes$5),
    						get_default_slot_context$5
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$h.name,
    		type: "slot",
    		source: "(100:0) <Render   {...$$restProps}   {...propsWeControl}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={\\\"ListboxOption\\\"}   on:click={handleClick}   on:focus={handleFocus}   on:pointermove={handleMove}   on:mousemove={handleMove}   on:pointerleave={handleLeave}   on:mouseleave={handleLeave} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let render;
    	let current;

    	const render_spread_levels = [
    		/*$$restProps*/ ctx[11],
    		/*propsWeControl*/ ctx[3],
    		{ as: /*as*/ ctx[0] },
    		{ slotProps: /*slotProps*/ ctx[2] },
    		{
    			use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[4]]
    		},
    		{ name: "ListboxOption" }
    	];

    	let render_props = {
    		$$slots: { default: [create_default_slot$h] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < render_spread_levels.length; i += 1) {
    		render_props = assign(render_props, render_spread_levels[i]);
    	}

    	render = new Render({ props: render_props, $$inline: true });
    	render.$on("click", /*handleClick*/ ctx[7]);
    	render.$on("focus", /*handleFocus*/ ctx[8]);
    	render.$on("pointermove", /*handleMove*/ ctx[9]);
    	render.$on("mousemove", /*handleMove*/ ctx[9]);
    	render.$on("pointerleave", /*handleLeave*/ ctx[10]);
    	render.$on("mouseleave", /*handleLeave*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(render.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(render, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const render_changes = (dirty & /*$$restProps, propsWeControl, as, slotProps, use, forwardEvents*/ 2079)
    			? get_spread_update(render_spread_levels, [
    					dirty & /*$$restProps*/ 2048 && get_spread_object(/*$$restProps*/ ctx[11]),
    					dirty & /*propsWeControl*/ 8 && get_spread_object(/*propsWeControl*/ ctx[3]),
    					dirty & /*as*/ 1 && { as: /*as*/ ctx[0] },
    					dirty & /*slotProps*/ 4 && { slotProps: /*slotProps*/ ctx[2] },
    					dirty & /*use, forwardEvents*/ 18 && {
    						use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[4]]
    					},
    					render_spread_levels[5]
    				])
    			: {};

    			if (dirty & /*$$scope, slotProps*/ 262148) {
    				render_changes.$$scope = { dirty, ctx };
    			}

    			render.$set(render_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(render.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(render.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(render, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let active;
    	let selected;
    	let dataRef;
    	let propsWeControl;
    	let slotProps;
    	const omit_props_names = ["as","use","value","disabled"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $api;
    	let $buttonRef;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListboxOption', slots, ['default']);
    	let { as = "li" } = $$props;
    	let { use = [] } = $$props;
    	let { value } = $$props;
    	let { disabled = false } = $$props;

    	/***** Events *****/
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	/***** Component *****/
    	let api = useListboxContext("ListboxOption");

    	validate_store(api, 'api');
    	component_subscribe($$self, api, value => $$invalidate(16, $api = value));
    	let id = `headlessui-listbox-option-${useId()}`;
    	let buttonRef = $api.buttonRef;
    	validate_store(buttonRef, 'buttonRef');
    	component_subscribe($$self, buttonRef, value => $$invalidate(23, $buttonRef = value));

    	onMount(() => {
    		let textValue = document.getElementById(id)?.textContent?.toLowerCase().trim();
    		if (textValue !== undefined) dataRef.textValue = textValue;
    	});

    	onMount(() => $api.registerOption(id, dataRef));
    	onDestroy(() => $api.unregisterOption(id));
    	let oldState = $api.listboxState;
    	let oldSelected = selected;
    	let oldActive = active;

    	async function updateFocus(newState, newSelected, newActive) {
    		// Wait for a tick since we need to ensure registerOption has been applied
    		await tick();

    		if (newState !== oldState || newSelected !== oldSelected) {
    			if (newState === ListboxStates.Open && newSelected) {
    				$api.goToOption(Focus.Specific, id);
    			}
    		}

    		if (newState !== oldState || newActive !== oldActive) {
    			if (newState === ListboxStates.Open && newActive) {
    				document.getElementById(id)?.scrollIntoView?.({ block: "nearest" });
    			}
    		}

    		oldState = newState;
    		oldSelected = newSelected;
    		oldActive = newActive;
    	}

    	async function handleClick(e) {
    		let event = e;
    		if (disabled) return event.preventDefault();
    		$api.select(value);
    		$api.closeListbox();
    		await tick();
    		$buttonRef?.focus({ preventScroll: true });
    	}

    	function handleFocus() {
    		if (disabled) return $api.goToOption(Focus.Nothing);
    		$api.goToOption(Focus.Specific, id);
    	}

    	function handleMove() {
    		if (disabled) return;
    		if (active) return;
    		$api.goToOption(Focus.Specific, id);
    	}

    	function handleLeave() {
    		if (disabled) return;
    		if (!active) return;
    		$api.goToOption(Focus.Nothing);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<ListboxOption> was created without expected prop 'value'");
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('value' in $$new_props) $$invalidate(12, value = $$new_props.value);
    		if ('disabled' in $$new_props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		tick,
    		ListboxStates,
    		useListboxContext,
    		useId,
    		Focus,
    		Render,
    		forwardEventsBuilder,
    		get_current_component,
    		as,
    		use,
    		value,
    		disabled,
    		forwardEvents,
    		api,
    		id,
    		buttonRef,
    		oldState,
    		oldSelected,
    		oldActive,
    		updateFocus,
    		handleClick,
    		handleFocus,
    		handleMove,
    		handleLeave,
    		selected,
    		active,
    		slotProps,
    		propsWeControl,
    		dataRef,
    		$api,
    		$buttonRef
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('value' in $$props) $$invalidate(12, value = $$new_props.value);
    		if ('disabled' in $$props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ('api' in $$props) $$invalidate(5, api = $$new_props.api);
    		if ('id' in $$props) $$invalidate(24, id = $$new_props.id);
    		if ('buttonRef' in $$props) $$invalidate(6, buttonRef = $$new_props.buttonRef);
    		if ('oldState' in $$props) oldState = $$new_props.oldState;
    		if ('oldSelected' in $$props) oldSelected = $$new_props.oldSelected;
    		if ('oldActive' in $$props) oldActive = $$new_props.oldActive;
    		if ('selected' in $$props) $$invalidate(14, selected = $$new_props.selected);
    		if ('active' in $$props) $$invalidate(15, active = $$new_props.active);
    		if ('slotProps' in $$props) $$invalidate(2, slotProps = $$new_props.slotProps);
    		if ('propsWeControl' in $$props) $$invalidate(3, propsWeControl = $$new_props.propsWeControl);
    		if ('dataRef' in $$props) dataRef = $$new_props.dataRef;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$api*/ 65536) {
    			$$invalidate(15, active = $api.activeOptionIndex !== null
    			? $api.options[$api.activeOptionIndex].id === id
    			: false);
    		}

    		if ($$self.$$.dirty & /*$api, value*/ 69632) {
    			$$invalidate(14, selected = $api.value === value);
    		}

    		if ($$self.$$.dirty & /*disabled, value*/ 12288) {
    			dataRef = { disabled, value, textValue: "" };
    		}

    		if ($$self.$$.dirty & /*$api, selected, active*/ 114688) {
    			updateFocus($api.listboxState, selected, active);
    		}

    		if ($$self.$$.dirty & /*disabled, selected*/ 24576) {
    			$$invalidate(3, propsWeControl = {
    				id,
    				role: "option",
    				tabIndex: disabled === true ? undefined : -1,
    				"aria-disabled": disabled === true ? true : undefined,
    				"aria-selected": selected === true ? selected : undefined
    			});
    		}

    		if ($$self.$$.dirty & /*active, selected, disabled*/ 57344) {
    			$$invalidate(2, slotProps = { active, selected, disabled });
    		}
    	};

    	return [
    		as,
    		use,
    		slotProps,
    		propsWeControl,
    		forwardEvents,
    		api,
    		buttonRef,
    		handleClick,
    		handleFocus,
    		handleMove,
    		handleLeave,
    		$$restProps,
    		value,
    		disabled,
    		selected,
    		active,
    		$api,
    		slots,
    		$$scope
    	];
    }

    class ListboxOption extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$q, create_fragment$q, safe_not_equal, { as: 0, use: 1, value: 12, disabled: 13 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListboxOption",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get as() {
    		throw new Error("<ListboxOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<ListboxOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<ListboxOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<ListboxOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListboxOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListboxOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ListboxOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ListboxOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\menu\Menu.svelte generated by Svelte v3.55.0 */

    var MenuStates;

    (function (MenuStates) {
    	MenuStates[MenuStates["Open"] = 0] = "Open";
    	MenuStates[MenuStates["Closed"] = 1] = "Closed";
    })(MenuStates || (MenuStates = {}));

    /* node_modules\@rgossiaux\svelte-headlessui\components\popover\Popover.svelte generated by Svelte v3.55.0 */

    var PopoverStates;

    (function (PopoverStates) {
    	PopoverStates[PopoverStates["Open"] = 0] = "Open";
    	PopoverStates[PopoverStates["Closed"] = 1] = "Closed";
    })(PopoverStates || (PopoverStates = {}));

    /* node_modules\@rgossiaux\svelte-headlessui\components\tabs\TabGroup.svelte generated by Svelte v3.55.0 */

    const { Error: Error_1 } = globals;
    const get_default_slot_spread_changes$4 = dirty => dirty & /*slotProps*/ 4;
    const get_default_slot_changes$4 = dirty => ({});
    const get_default_slot_context$4 = ctx => ({ .../*slotProps*/ ctx[2] });

    // (116:0) <Render   {...$$restProps}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={"TabGroup"} >
    function create_default_slot$g(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], get_default_slot_context$4);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, slotProps*/ 8196)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[13],
    						get_default_slot_spread_changes$4(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[13])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, get_default_slot_changes$4),
    						get_default_slot_context$4
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$g.name,
    		type: "slot",
    		source: "(116:0) <Render   {...$$restProps}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={\\\"TabGroup\\\"} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let render;
    	let current;

    	const render_spread_levels = [
    		/*$$restProps*/ ctx[5],
    		{ as: /*as*/ ctx[0] },
    		{ slotProps: /*slotProps*/ ctx[2] },
    		{
    			use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[3]]
    		},
    		{ name: "TabGroup" }
    	];

    	let render_props = {
    		$$slots: { default: [create_default_slot$g] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < render_spread_levels.length; i += 1) {
    		render_props = assign(render_props, render_spread_levels[i]);
    	}

    	render = new Render({ props: render_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(render.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(render, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const render_changes = (dirty & /*$$restProps, as, slotProps, use, forwardEvents*/ 47)
    			? get_spread_update(render_spread_levels, [
    					dirty & /*$$restProps*/ 32 && get_spread_object(/*$$restProps*/ ctx[5]),
    					dirty & /*as*/ 1 && { as: /*as*/ ctx[0] },
    					dirty & /*slotProps*/ 4 && { slotProps: /*slotProps*/ ctx[2] },
    					dirty & /*use, forwardEvents*/ 10 && {
    						use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[3]]
    					},
    					render_spread_levels[4]
    				])
    			: {};

    			if (dirty & /*$$scope, slotProps*/ 8196) {
    				render_changes.$$scope = { dirty, ctx };
    			}

    			render.$set(render_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(render.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(render.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(render, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS_CONTEXT_NAME = "headlessui-tabs-context";

    function useTabsContext(component) {
    	let context = getContext(TABS_CONTEXT_NAME);

    	if (context === undefined) {
    		throw new Error(`<${component} /> is missing a parent <TabGroup /> component.`);
    	}

    	return context;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let slotProps;
    	const omit_props_names = ["as","use","defaultIndex","vertical","manual"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $listRef;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabGroup', slots, ['default']);
    	let { as = "div" } = $$props;
    	let { use = [] } = $$props;
    	let { defaultIndex = 0 } = $$props;
    	let { vertical = false } = $$props;
    	let { manual = false } = $$props;

    	/***** Events *****/
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ["change"]);

    	const dispatch = createEventDispatcher();

    	/***** Component *****/
    	let selectedIndex = null;

    	let tabs = [];
    	let panels = [];
    	let listRef = writable(null);
    	validate_store(listRef, 'listRef');
    	component_subscribe($$self, listRef, value => $$invalidate(14, $listRef = value));

    	let api = writable({
    		selectedIndex,
    		orientation: vertical ? "vertical" : "horizontal",
    		activation: manual ? "manual" : "auto",
    		tabs,
    		panels,
    		listRef,
    		setSelectedIndex(index) {
    			if (selectedIndex === index) return;
    			$$invalidate(9, selectedIndex = index);
    			dispatch("change", index);
    		},
    		registerTab(tab) {
    			if (tabs.includes(tab)) return;

    			if (!$listRef) {
    				// We haven't mounted yet so just append
    				$$invalidate(10, tabs = [...tabs, tab]);

    				return;
    			}

    			let currentSelectedTab = selectedIndex !== null ? tabs[selectedIndex] : null;
    			let orderMap = Array.from($listRef.querySelectorAll('[id^="headlessui-tabs-tab-"]')).reduce((lookup, element, index) => Object.assign(lookup, { [element.id]: index }), {});
    			let nextTabs = [...tabs, tab];
    			nextTabs.sort((a, z) => orderMap[a.id] - orderMap[z.id]);
    			$$invalidate(10, tabs = nextTabs);

    			// Maintain the correct item active
    			$$invalidate(9, selectedIndex = (() => {
    				if (currentSelectedTab === null) return null;
    				return tabs.indexOf(currentSelectedTab);
    			})());
    		},
    		unregisterTab(tab) {
    			$$invalidate(10, tabs = tabs.filter(t => t !== tab));
    		},
    		registerPanel(panel) {
    			if (!panels.includes(panel)) $$invalidate(11, panels = [...panels, panel]);
    		},
    		unregisterPanel(panel) {
    			$$invalidate(11, panels = panels.filter(p => p !== panel));
    		}
    	});

    	setContext(TABS_CONTEXT_NAME, api);

    	onMount(() => {
    		if (tabs.length <= 0) return;
    		if (selectedIndex !== null) return;
    		let mountedTabs = tabs.filter(Boolean);
    		let focusableTabs = mountedTabs.filter(tab => !tab.hasAttribute("disabled"));
    		if (focusableTabs.length <= 0) return;

    		// Underflow
    		if (defaultIndex < 0) {
    			$$invalidate(9, selectedIndex = mountedTabs.indexOf(focusableTabs[0]));
    		} else // Overflow
    		if (defaultIndex > mountedTabs.length) {
    			$$invalidate(9, selectedIndex = mountedTabs.indexOf(focusableTabs[focusableTabs.length - 1]));
    		} else // Middle
    		{
    			let before = mountedTabs.slice(0, defaultIndex);
    			let after = mountedTabs.slice(defaultIndex);
    			let next = [...after, ...before].find(tab => focusableTabs.includes(tab));
    			if (!next) return;
    			$$invalidate(9, selectedIndex = mountedTabs.indexOf(next));
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('defaultIndex' in $$new_props) $$invalidate(6, defaultIndex = $$new_props.defaultIndex);
    		if ('vertical' in $$new_props) $$invalidate(7, vertical = $$new_props.vertical);
    		if ('manual' in $$new_props) $$invalidate(8, manual = $$new_props.manual);
    		if ('$$scope' in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS_CONTEXT_NAME,
    		useTabsContext,
    		createEventDispatcher,
    		getContext,
    		onMount,
    		setContext,
    		writable,
    		forwardEventsBuilder,
    		get_current_component,
    		Render,
    		as,
    		use,
    		defaultIndex,
    		vertical,
    		manual,
    		forwardEvents,
    		dispatch,
    		selectedIndex,
    		tabs,
    		panels,
    		listRef,
    		api,
    		slotProps,
    		$listRef
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('defaultIndex' in $$props) $$invalidate(6, defaultIndex = $$new_props.defaultIndex);
    		if ('vertical' in $$props) $$invalidate(7, vertical = $$new_props.vertical);
    		if ('manual' in $$props) $$invalidate(8, manual = $$new_props.manual);
    		if ('selectedIndex' in $$props) $$invalidate(9, selectedIndex = $$new_props.selectedIndex);
    		if ('tabs' in $$props) $$invalidate(10, tabs = $$new_props.tabs);
    		if ('panels' in $$props) $$invalidate(11, panels = $$new_props.panels);
    		if ('listRef' in $$props) $$invalidate(4, listRef = $$new_props.listRef);
    		if ('api' in $$props) $$invalidate(16, api = $$new_props.api);
    		if ('slotProps' in $$props) $$invalidate(2, slotProps = $$new_props.slotProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedIndex, vertical, manual, tabs, panels*/ 3968) {
    			api.update(obj => {
    				return {
    					...obj,
    					selectedIndex,
    					orientation: vertical ? "vertical" : "horizontal",
    					activation: manual ? "manual" : "auto",
    					tabs,
    					panels
    				};
    			});
    		}

    		if ($$self.$$.dirty & /*selectedIndex*/ 512) {
    			$$invalidate(2, slotProps = { selectedIndex });
    		}
    	};

    	return [
    		as,
    		use,
    		slotProps,
    		forwardEvents,
    		listRef,
    		$$restProps,
    		defaultIndex,
    		vertical,
    		manual,
    		selectedIndex,
    		tabs,
    		panels,
    		slots,
    		$$scope
    	];
    }

    class TabGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$2(this, options, instance$p, create_fragment$p, safe_not_equal, {
    			as: 0,
    			use: 1,
    			defaultIndex: 6,
    			vertical: 7,
    			manual: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabGroup",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get as() {
    		throw new Error_1("<TabGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error_1("<TabGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error_1("<TabGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error_1("<TabGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultIndex() {
    		throw new Error_1("<TabGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultIndex(value) {
    		throw new Error_1("<TabGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error_1("<TabGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error_1("<TabGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get manual() {
    		throw new Error_1("<TabGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set manual(value) {
    		throw new Error_1("<TabGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\tabs\Tab.svelte generated by Svelte v3.55.0 */
    const get_default_slot_spread_changes$3 = dirty => dirty & /*slotProps*/ 32;
    const get_default_slot_changes$3 = dirty => ({});
    const get_default_slot_context$3 = ctx => ({ .../*slotProps*/ ctx[5] });

    // (92:0) <Render   {...{ ...$$restProps, ...propsWeControl }}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={"Tab"}   bind:el={tabRef}   on:keydown={handleKeyDown}   on:click={handleSelection}   on:focus={$api.activation === "manual" ? handleFocus : handleSelection} >
    function create_default_slot$f(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], get_default_slot_context$3);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, slotProps*/ 524320)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						get_default_slot_spread_changes$3(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, get_default_slot_changes$3),
    						get_default_slot_context$3
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$f.name,
    		type: "slot",
    		source: "(92:0) <Render   {...{ ...$$restProps, ...propsWeControl }}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={\\\"Tab\\\"}   bind:el={tabRef}   on:keydown={handleKeyDown}   on:click={handleSelection}   on:focus={$api.activation === \\\"manual\\\" ? handleFocus : handleSelection} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let render;
    	let updating_el;
    	let current;

    	const render_spread_levels = [
    		{
    			.../*$$restProps*/ ctx[12],
    			.../*propsWeControl*/ ctx[3]
    		},
    		{ as: /*as*/ ctx[0] },
    		{ slotProps: /*slotProps*/ ctx[5] },
    		{
    			use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[7]]
    		},
    		{ name: "Tab" }
    	];

    	function render_el_binding(value) {
    		/*render_el_binding*/ ctx[18](value);
    	}

    	let render_props = {
    		$$slots: { default: [create_default_slot$f] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < render_spread_levels.length; i += 1) {
    		render_props = assign(render_props, render_spread_levels[i]);
    	}

    	if (/*tabRef*/ ctx[2] !== void 0) {
    		render_props.el = /*tabRef*/ ctx[2];
    	}

    	render = new Render({ props: render_props, $$inline: true });
    	binding_callbacks.push(() => bind(render, 'el', render_el_binding, /*tabRef*/ ctx[2]));
    	render.$on("keydown", /*handleKeyDown*/ ctx[9]);
    	render.$on("click", /*handleSelection*/ ctx[11]);

    	render.$on("focus", function () {
    		if (is_function(/*$api*/ ctx[4].activation === "manual"
    		? /*handleFocus*/ ctx[10]
    		: /*handleSelection*/ ctx[11])) (/*$api*/ ctx[4].activation === "manual"
    		? /*handleFocus*/ ctx[10]
    		: /*handleSelection*/ ctx[11]).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(render.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(render, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			const render_changes = (dirty & /*$$restProps, propsWeControl, as, slotProps, use, forwardEvents*/ 4267)
    			? get_spread_update(render_spread_levels, [
    					dirty & /*$$restProps, propsWeControl*/ 4104 && {
    						.../*$$restProps*/ ctx[12],
    						.../*propsWeControl*/ ctx[3]
    					},
    					dirty & /*as*/ 1 && { as: /*as*/ ctx[0] },
    					dirty & /*slotProps*/ 32 && { slotProps: /*slotProps*/ ctx[5] },
    					dirty & /*use, forwardEvents*/ 130 && {
    						use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[7]]
    					},
    					render_spread_levels[4]
    				])
    			: {};

    			if (dirty & /*$$scope, slotProps*/ 524320) {
    				render_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_el && dirty & /*tabRef*/ 4) {
    				updating_el = true;
    				render_changes.el = /*tabRef*/ ctx[2];
    				add_flush_callback(() => updating_el = false);
    			}

    			render.$set(render_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(render.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(render.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(render, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let myIndex;
    	let selected;
    	let myPanelRef;
    	let propsWeControl;
    	let slotProps;
    	const omit_props_names = ["as","use","disabled"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $api;

    	let $myPanelRef,
    		$$unsubscribe_myPanelRef = noop,
    		$$subscribe_myPanelRef = () => ($$unsubscribe_myPanelRef(), $$unsubscribe_myPanelRef = subscribe(myPanelRef, $$value => $$invalidate(16, $myPanelRef = $$value)), myPanelRef);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_myPanelRef());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, ['default']);
    	let { as = "button" } = $$props;
    	let { use = [] } = $$props;
    	let { disabled = false } = $$props;

    	/***** Events *****/
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	/***** Component *****/
    	let api = useTabsContext("Tab");

    	validate_store(api, 'api');
    	component_subscribe($$self, api, value => $$invalidate(4, $api = value));
    	let id = `headlessui-tabs-tab-${useId()}`;
    	let tabRef = null;

    	onMount(() => {
    		$api.registerTab(tabRef);
    		return () => $api.unregisterTab(tabRef);
    	});

    	function handleKeyDown(e) {
    		let event = e;
    		let list = $api.tabs.filter(Boolean);

    		if (event.key === Keys.Space || event.key === Keys.Enter) {
    			event.preventDefault();
    			event.stopPropagation();
    			$api.setSelectedIndex(myIndex);
    			return;
    		}

    		switch (event.key) {
    			case Keys.Home:
    			case Keys.PageUp:
    				event.preventDefault();
    				event.stopPropagation();
    				return focusIn(list, Focus$1.First);
    			case Keys.End:
    			case Keys.PageDown:
    				event.preventDefault();
    				event.stopPropagation();
    				return focusIn(list, Focus$1.Last);
    		}

    		return match($api.orientation, {
    			vertical() {
    				if (event.key === Keys.ArrowUp) return focusIn(list, Focus$1.Previous | Focus$1.WrapAround);
    				if (event.key === Keys.ArrowDown) return focusIn(list, Focus$1.Next | Focus$1.WrapAround);
    				return;
    			},
    			horizontal() {
    				if (event.key === Keys.ArrowLeft) return focusIn(list, Focus$1.Previous | Focus$1.WrapAround);
    				if (event.key === Keys.ArrowRight) return focusIn(list, Focus$1.Next | Focus$1.WrapAround);
    				return;
    			}
    		});
    	}

    	function handleFocus() {
    		tabRef?.focus();
    	}

    	function handleSelection() {
    		if (disabled) return;
    		tabRef?.focus();
    		$api.setSelectedIndex(myIndex);
    	}

    	function render_el_binding(value) {
    		tabRef = value;
    		$$invalidate(2, tabRef);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(21, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('disabled' in $$new_props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ('$$scope' in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Focus: Focus$1,
    		focusIn,
    		Keys,
    		match,
    		useTabsContext,
    		useId,
    		forwardEventsBuilder,
    		get_current_component,
    		Render,
    		resolveButtonType,
    		as,
    		use,
    		disabled,
    		forwardEvents,
    		api,
    		id,
    		tabRef,
    		handleKeyDown,
    		handleFocus,
    		handleSelection,
    		selected,
    		slotProps,
    		myIndex,
    		propsWeControl,
    		myPanelRef,
    		$api,
    		$myPanelRef
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(21, $$props = assign(assign({}, $$props), $$new_props));
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('disabled' in $$props) $$invalidate(13, disabled = $$new_props.disabled);
    		if ('api' in $$props) $$invalidate(8, api = $$new_props.api);
    		if ('id' in $$props) $$invalidate(20, id = $$new_props.id);
    		if ('tabRef' in $$props) $$invalidate(2, tabRef = $$new_props.tabRef);
    		if ('selected' in $$props) $$invalidate(14, selected = $$new_props.selected);
    		if ('slotProps' in $$props) $$invalidate(5, slotProps = $$new_props.slotProps);
    		if ('myIndex' in $$props) $$invalidate(15, myIndex = $$new_props.myIndex);
    		if ('propsWeControl' in $$props) $$invalidate(3, propsWeControl = $$new_props.propsWeControl);
    		if ('myPanelRef' in $$props) $$subscribe_myPanelRef($$invalidate(6, myPanelRef = $$new_props.myPanelRef));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tabRef, $api*/ 20) {
    			$$invalidate(15, myIndex = tabRef ? $api.tabs.indexOf(tabRef) : -1);
    		}

    		if ($$self.$$.dirty & /*myIndex, $api*/ 32784) {
    			$$invalidate(14, selected = myIndex === $api.selectedIndex);
    		}

    		if ($$self.$$.dirty & /*$api, myIndex*/ 32784) {
    			$$subscribe_myPanelRef($$invalidate(6, myPanelRef = $api.panels[myIndex]?.ref));
    		}

    		$$invalidate(3, propsWeControl = {
    			id,
    			role: "tab",
    			type: resolveButtonType({ type: $$props.type, as }, tabRef),
    			"aria-controls": $myPanelRef ? $api.panels[myIndex]?.id : undefined,
    			"aria-selected": selected,
    			tabIndex: selected ? 0 : -1,
    			disabled: disabled ? true : undefined
    		});

    		if ($$self.$$.dirty & /*propsWeControl, myIndex*/ 32776) ;

    		if ($$self.$$.dirty & /*selected*/ 16384) {
    			$$invalidate(5, slotProps = { selected });
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		as,
    		use,
    		tabRef,
    		propsWeControl,
    		$api,
    		slotProps,
    		myPanelRef,
    		forwardEvents,
    		api,
    		handleKeyDown,
    		handleFocus,
    		handleSelection,
    		$$restProps,
    		disabled,
    		selected,
    		myIndex,
    		$myPanelRef,
    		slots,
    		render_el_binding,
    		$$scope
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$o, create_fragment$o, safe_not_equal, { as: 0, use: 1, disabled: 13 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get as() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\tabs\TabList.svelte generated by Svelte v3.55.0 */
    const get_default_slot_spread_changes$2 = dirty => dirty & /*slotProps*/ 4;
    const get_default_slot_changes$2 = dirty => ({});
    const get_default_slot_context$2 = ctx => ({ .../*slotProps*/ ctx[2] });

    // (22:0) <Render   {...{ ...$$restProps, ...propsWeControl }}   {as}   {slotProps}   bind:el={$listRef}   use={[...use, forwardEvents]}   name={"TabList"} >
    function create_default_slot$e(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context$2);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, slotProps*/ 4100)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						get_default_slot_spread_changes$2(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes$2),
    						get_default_slot_context$2
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$e.name,
    		type: "slot",
    		source: "(22:0) <Render   {...{ ...$$restProps, ...propsWeControl }}   {as}   {slotProps}   bind:el={$listRef}   use={[...use, forwardEvents]}   name={\\\"TabList\\\"} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let render;
    	let updating_el;
    	let current;

    	const render_spread_levels = [
    		{
    			.../*$$restProps*/ ctx[8],
    			.../*propsWeControl*/ ctx[3]
    		},
    		{ as: /*as*/ ctx[0] },
    		{ slotProps: /*slotProps*/ ctx[2] },
    		{
    			use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[5]]
    		},
    		{ name: "TabList" }
    	];

    	function render_el_binding(value) {
    		/*render_el_binding*/ ctx[11](value);
    	}

    	let render_props = {
    		$$slots: { default: [create_default_slot$e] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < render_spread_levels.length; i += 1) {
    		render_props = assign(render_props, render_spread_levels[i]);
    	}

    	if (/*$listRef*/ ctx[4] !== void 0) {
    		render_props.el = /*$listRef*/ ctx[4];
    	}

    	render = new Render({ props: render_props, $$inline: true });
    	binding_callbacks.push(() => bind(render, 'el', render_el_binding, /*$listRef*/ ctx[4]));

    	const block = {
    		c: function create() {
    			create_component(render.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(render, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const render_changes = (dirty & /*$$restProps, propsWeControl, as, slotProps, use, forwardEvents*/ 303)
    			? get_spread_update(render_spread_levels, [
    					dirty & /*$$restProps, propsWeControl*/ 264 && {
    						.../*$$restProps*/ ctx[8],
    						.../*propsWeControl*/ ctx[3]
    					},
    					dirty & /*as*/ 1 && { as: /*as*/ ctx[0] },
    					dirty & /*slotProps*/ 4 && { slotProps: /*slotProps*/ ctx[2] },
    					dirty & /*use, forwardEvents*/ 34 && {
    						use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[5]]
    					},
    					render_spread_levels[4]
    				])
    			: {};

    			if (dirty & /*$$scope, slotProps*/ 4100) {
    				render_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_el && dirty & /*$listRef*/ 16) {
    				updating_el = true;
    				render_changes.el = /*$listRef*/ ctx[4];
    				add_flush_callback(() => updating_el = false);
    			}

    			render.$set(render_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(render.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(render.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(render, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let propsWeControl;
    	let slotProps;
    	const omit_props_names = ["as","use"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $api;
    	let $listRef;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabList', slots, ['default']);
    	let { as = "div" } = $$props;
    	let { use = [] } = $$props;

    	/***** Events *****/
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	/***** Component *****/
    	let api = useTabsContext("TabList");

    	validate_store(api, 'api');
    	component_subscribe($$self, api, value => $$invalidate(9, $api = value));
    	let listRef = $api.listRef;
    	validate_store(listRef, 'listRef');
    	component_subscribe($$self, listRef, value => $$invalidate(4, $listRef = value));

    	function render_el_binding(value) {
    		$listRef = value;
    		listRef.set($listRef);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		useTabsContext,
    		forwardEventsBuilder,
    		get_current_component,
    		Render,
    		as,
    		use,
    		forwardEvents,
    		api,
    		listRef,
    		slotProps,
    		propsWeControl,
    		$api,
    		$listRef
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('api' in $$props) $$invalidate(6, api = $$new_props.api);
    		if ('listRef' in $$props) $$invalidate(7, listRef = $$new_props.listRef);
    		if ('slotProps' in $$props) $$invalidate(2, slotProps = $$new_props.slotProps);
    		if ('propsWeControl' in $$props) $$invalidate(3, propsWeControl = $$new_props.propsWeControl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$api*/ 512) {
    			$$invalidate(3, propsWeControl = {
    				role: "tablist",
    				"aria-orientation": $api.orientation
    			});
    		}

    		if ($$self.$$.dirty & /*$api*/ 512) {
    			$$invalidate(2, slotProps = { selectedIndex: $api.selectedIndex });
    		}
    	};

    	return [
    		as,
    		use,
    		slotProps,
    		propsWeControl,
    		$listRef,
    		forwardEvents,
    		api,
    		listRef,
    		$$restProps,
    		$api,
    		slots,
    		render_el_binding,
    		$$scope
    	];
    }

    class TabList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$n, create_fragment$n, safe_not_equal, { as: 0, use: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabList",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get as() {
    		throw new Error("<TabList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<TabList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<TabList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TabList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\tabs\TabPanels.svelte generated by Svelte v3.55.0 */
    const get_default_slot_spread_changes$1 = dirty => dirty & /*slotProps*/ 4;
    const get_default_slot_changes$1 = dirty => ({});
    const get_default_slot_context$1 = ctx => ({ .../*slotProps*/ ctx[2] });

    // (17:0) <Render   {...$$restProps}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={"TabPanels"} >
    function create_default_slot$d(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, slotProps*/ 260)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						get_default_slot_spread_changes$1(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(17:0) <Render   {...$$restProps}   {as}   {slotProps}   use={[...use, forwardEvents]}   name={\\\"TabPanels\\\"} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let render;
    	let current;

    	const render_spread_levels = [
    		/*$$restProps*/ ctx[5],
    		{ as: /*as*/ ctx[0] },
    		{ slotProps: /*slotProps*/ ctx[2] },
    		{
    			use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[3]]
    		},
    		{ name: "TabPanels" }
    	];

    	let render_props = {
    		$$slots: { default: [create_default_slot$d] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < render_spread_levels.length; i += 1) {
    		render_props = assign(render_props, render_spread_levels[i]);
    	}

    	render = new Render({ props: render_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(render.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(render, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const render_changes = (dirty & /*$$restProps, as, slotProps, use, forwardEvents*/ 47)
    			? get_spread_update(render_spread_levels, [
    					dirty & /*$$restProps*/ 32 && get_spread_object(/*$$restProps*/ ctx[5]),
    					dirty & /*as*/ 1 && { as: /*as*/ ctx[0] },
    					dirty & /*slotProps*/ 4 && { slotProps: /*slotProps*/ ctx[2] },
    					dirty & /*use, forwardEvents*/ 10 && {
    						use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[3]]
    					},
    					render_spread_levels[4]
    				])
    			: {};

    			if (dirty & /*$$scope, slotProps*/ 260) {
    				render_changes.$$scope = { dirty, ctx };
    			}

    			render.$set(render_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(render.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(render.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(render, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let slotProps;
    	const omit_props_names = ["as","use"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $api;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabPanels', slots, ['default']);
    	let { as = "div" } = $$props;
    	let { use = [] } = $$props;

    	/***** Events *****/
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	/***** Component *****/
    	let api = useTabsContext("TabPanels");

    	validate_store(api, 'api');
    	component_subscribe($$self, api, value => $$invalidate(6, $api = value));

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		useTabsContext,
    		forwardEventsBuilder,
    		get_current_component,
    		Render,
    		as,
    		use,
    		forwardEvents,
    		api,
    		slotProps,
    		$api
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('api' in $$props) $$invalidate(4, api = $$new_props.api);
    		if ('slotProps' in $$props) $$invalidate(2, slotProps = $$new_props.slotProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$api*/ 64) {
    			$$invalidate(2, slotProps = { selectedIndex: $api.selectedIndex });
    		}
    	};

    	return [as, use, slotProps, forwardEvents, api, $$restProps, $api, slots, $$scope];
    }

    class TabPanels extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$m, create_fragment$m, safe_not_equal, { as: 0, use: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanels",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get as() {
    		throw new Error("<TabPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<TabPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<TabPanels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TabPanels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@rgossiaux\svelte-headlessui\components\tabs\TabPanel.svelte generated by Svelte v3.55.0 */
    const get_default_slot_spread_changes = dirty => dirty & /*slotProps*/ 16;
    const get_default_slot_changes = dirty => ({});
    const get_default_slot_context = ctx => ({ .../*slotProps*/ ctx[4] });

    // (39:0) <Render   {...{ ...$$restProps, ...propsWeControl }}   {as}   use={[...use, forwardEvents]}   name={"TabPanel"}   {slotProps}   bind:el={$elementRef}   visible={selected}   features={Features.RenderStrategy | Features.Static} >
    function create_default_slot$c(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, slotProps*/ 32784)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						get_default_slot_spread_changes(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(39:0) <Render   {...{ ...$$restProps, ...propsWeControl }}   {as}   use={[...use, forwardEvents]}   name={\\\"TabPanel\\\"}   {slotProps}   bind:el={$elementRef}   visible={selected}   features={Features.RenderStrategy | Features.Static} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let render;
    	let updating_el;
    	let current;

    	const render_spread_levels = [
    		{
    			.../*$$restProps*/ ctx[9],
    			.../*propsWeControl*/ ctx[3]
    		},
    		{ as: /*as*/ ctx[0] },
    		{
    			use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[6]]
    		},
    		{ name: "TabPanel" },
    		{ slotProps: /*slotProps*/ ctx[4] },
    		{ visible: /*selected*/ ctx[2] },
    		{
    			features: Features.RenderStrategy | Features.Static
    		}
    	];

    	function render_el_binding(value) {
    		/*render_el_binding*/ ctx[14](value);
    	}

    	let render_props = {
    		$$slots: { default: [create_default_slot$c] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < render_spread_levels.length; i += 1) {
    		render_props = assign(render_props, render_spread_levels[i]);
    	}

    	if (/*$elementRef*/ ctx[5] !== void 0) {
    		render_props.el = /*$elementRef*/ ctx[5];
    	}

    	render = new Render({ props: render_props, $$inline: true });
    	binding_callbacks.push(() => bind(render, 'el', render_el_binding, /*$elementRef*/ ctx[5]));

    	const block = {
    		c: function create() {
    			create_component(render.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(render, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const render_changes = (dirty & /*$$restProps, propsWeControl, as, use, forwardEvents, slotProps, selected, Features*/ 607)
    			? get_spread_update(render_spread_levels, [
    					dirty & /*$$restProps, propsWeControl*/ 520 && {
    						.../*$$restProps*/ ctx[9],
    						.../*propsWeControl*/ ctx[3]
    					},
    					dirty & /*as*/ 1 && { as: /*as*/ ctx[0] },
    					dirty & /*use, forwardEvents*/ 66 && {
    						use: [.../*use*/ ctx[1], /*forwardEvents*/ ctx[6]]
    					},
    					render_spread_levels[3],
    					dirty & /*slotProps*/ 16 && { slotProps: /*slotProps*/ ctx[4] },
    					dirty & /*selected*/ 4 && { visible: /*selected*/ ctx[2] },
    					dirty & /*Features*/ 0 && {
    						features: Features.RenderStrategy | Features.Static
    					}
    				])
    			: {};

    			if (dirty & /*$$scope, slotProps*/ 32784) {
    				render_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_el && dirty & /*$elementRef*/ 32) {
    				updating_el = true;
    				render_changes.el = /*$elementRef*/ ctx[5];
    				add_flush_callback(() => updating_el = false);
    			}

    			render.$set(render_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(render.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(render.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(render, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let panelData;
    	let myIndex;
    	let selected;
    	let propsWeControl;
    	let slotProps;
    	const omit_props_names = ["as","use"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $api;
    	let $elementRef;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabPanel', slots, ['default']);
    	let { as = "div" } = $$props;
    	let { use = [] } = $$props;

    	/***** Events *****/
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	/***** Component *****/
    	let elementRef = writable(null);

    	validate_store(elementRef, 'elementRef');
    	component_subscribe($$self, elementRef, value => $$invalidate(5, $elementRef = value));
    	let api = useTabsContext("TabPanel");
    	validate_store(api, 'api');
    	component_subscribe($$self, api, value => $$invalidate(12, $api = value));
    	let id = `headlessui-tabs-panel-${useId()}`;

    	onMount(() => {
    		$api.registerPanel(panelData);
    		return () => $api.unregisterPanel(panelData);
    	});

    	function render_el_binding(value) {
    		$elementRef = value;
    		elementRef.set($elementRef);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('as' in $$new_props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		useTabsContext,
    		useId,
    		forwardEventsBuilder,
    		get_current_component,
    		Render,
    		writable,
    		Features,
    		as,
    		use,
    		forwardEvents,
    		elementRef,
    		api,
    		id,
    		selected,
    		slotProps,
    		myIndex,
    		propsWeControl,
    		panelData,
    		$api,
    		$elementRef
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('as' in $$props) $$invalidate(0, as = $$new_props.as);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('elementRef' in $$props) $$invalidate(7, elementRef = $$new_props.elementRef);
    		if ('api' in $$props) $$invalidate(8, api = $$new_props.api);
    		if ('id' in $$props) $$invalidate(16, id = $$new_props.id);
    		if ('selected' in $$props) $$invalidate(2, selected = $$new_props.selected);
    		if ('slotProps' in $$props) $$invalidate(4, slotProps = $$new_props.slotProps);
    		if ('myIndex' in $$props) $$invalidate(10, myIndex = $$new_props.myIndex);
    		if ('propsWeControl' in $$props) $$invalidate(3, propsWeControl = $$new_props.propsWeControl);
    		if ('panelData' in $$props) $$invalidate(11, panelData = $$new_props.panelData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$api, panelData*/ 6144) {
    			$$invalidate(10, myIndex = $api.panels.indexOf(panelData));
    		}

    		if ($$self.$$.dirty & /*myIndex, $api*/ 5120) {
    			$$invalidate(2, selected = myIndex === $api.selectedIndex);
    		}

    		if ($$self.$$.dirty & /*$api, myIndex, selected*/ 5124) {
    			$$invalidate(3, propsWeControl = {
    				id,
    				role: "tabpanel",
    				"aria-labelledby": $api.tabs[myIndex]?.id,
    				tabIndex: selected ? 0 : -1
    			});
    		}

    		if ($$self.$$.dirty & /*propsWeControl, myIndex*/ 1032) ;

    		if ($$self.$$.dirty & /*selected*/ 4) {
    			$$invalidate(4, slotProps = { selected });
    		}
    	};

    	$$invalidate(11, panelData = { id, ref: elementRef });

    	return [
    		as,
    		use,
    		selected,
    		propsWeControl,
    		slotProps,
    		$elementRef,
    		forwardEvents,
    		elementRef,
    		api,
    		$$restProps,
    		myIndex,
    		panelData,
    		$api,
    		slots,
    		render_el_binding,
    		$$scope
    	];
    }

    class TabPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$l, create_fragment$l, safe_not_equal, { as: 0, use: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanel",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get as() {
    		throw new Error("<TabPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<TabPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<TabPanel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TabPanel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Reason;
    (function (Reason) {
        Reason["Finished"] = "finished";
        Reason["Cancelled"] = "cancelled";
    })(Reason || (Reason = {}));

    /* node_modules\@rgossiaux\svelte-headlessui\components\transitions\common.svelte generated by Svelte v3.55.0 */

    var TreeStates;

    (function (TreeStates) {
    	TreeStates["Visible"] = "visible";
    	TreeStates["Hidden"] = "hidden";
    })(TreeStates || (TreeStates = {}));

    /* src\shared\components\flags\it.svelte generated by Svelte v3.55.0 */

    const file$e = "src\\shared\\components\\flags\\it.svelte";

    function create_fragment$k(ctx) {
    	let svg;
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "fill", "#fff");
    			attr_dev(path0, "d", "M0 0h640v480H0z");
    			add_location(path0, file$e, 2, 2, 131);
    			attr_dev(path1, "fill", "#009246");
    			attr_dev(path1, "d", "M0 0h213.3v480H0z");
    			add_location(path1, file$e, 3, 2, 174);
    			attr_dev(path2, "fill", "#ce2b37");
    			attr_dev(path2, "d", "M426.7 0H640v480H426.7z");
    			add_location(path2, file$e, 4, 2, 222);
    			attr_dev(g, "fill-rule", "evenodd");
    			attr_dev(g, "stroke-width", "1pt");
    			add_location(g, file$e, 1, 1, 86);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 640 480");
    			attr_dev(svg, "class", svg_class_value = /*$$props*/ ctx[0].class);
    			add_location(svg, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$props*/ 1 && svg_class_value !== (svg_class_value = /*$$props*/ ctx[0].class)) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('It', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class It extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "It",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\shared\components\flags\en.svelte generated by Svelte v3.55.0 */

    const file$d = "src\\shared\\components\\flags\\en.svelte";

    function create_fragment$j(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			attr_dev(path0, "fill", "#012169");
    			attr_dev(path0, "d", "M0 0h640v480H0z");
    			add_location(path0, file$d, 1, 1, 86);
    			attr_dev(path1, "fill", "#FFF");
    			attr_dev(path1, "d", "m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z");
    			add_location(path1, file$d, 2, 1, 131);
    			attr_dev(path2, "fill", "#C8102E");
    			attr_dev(path2, "d", "m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z");
    			add_location(path2, file$d, 6, 1, 251);
    			attr_dev(path3, "fill", "#FFF");
    			attr_dev(path3, "d", "M241 0v480h160V0H241zM0 160v160h640V160H0z");
    			add_location(path3, file$d, 10, 1, 403);
    			attr_dev(path4, "fill", "#C8102E");
    			attr_dev(path4, "d", "M0 193v96h640v-96H0zM273 0v480h96V0h-96z");
    			add_location(path4, file$d, 11, 1, 472);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 640 480");
    			attr_dev(svg, "class", svg_class_value = /*$$props*/ ctx[0].class);
    			add_location(svg, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$props*/ 1 && svg_class_value !== (svg_class_value = /*$$props*/ ctx[0].class)) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('En', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class En extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "En",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\shared\components\flags\es.svelte generated by Svelte v3.55.0 */

    const file$c = "src\\shared\\components\\flags\\es.svelte";

    function create_fragment$i(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let path17;
    	let path18;
    	let path19;
    	let path20;
    	let path21;
    	let path22;
    	let path23;
    	let path24;
    	let path25;
    	let path26;
    	let path27;
    	let path28;
    	let path29;
    	let path30;
    	let path31;
    	let path32;
    	let path33;
    	let path34;
    	let path35;
    	let path36;
    	let path37;
    	let path38;
    	let path39;
    	let path40;
    	let path41;
    	let path42;
    	let path43;
    	let path44;
    	let path45;
    	let path46;
    	let path47;
    	let path48;
    	let path49;
    	let path50;
    	let path51;
    	let path52;
    	let path53;
    	let path54;
    	let path55;
    	let path56;
    	let path57;
    	let path58;
    	let path59;
    	let path60;
    	let path61;
    	let path62;
    	let path63;
    	let path64;
    	let path65;
    	let path66;
    	let path67;
    	let path68;
    	let path69;
    	let path70;
    	let path71;
    	let path72;
    	let path73;
    	let path74;
    	let path75;
    	let path76;
    	let path77;
    	let path78;
    	let path79;
    	let path80;
    	let path81;
    	let path82;
    	let path83;
    	let path84;
    	let path85;
    	let path86;
    	let path87;
    	let path88;
    	let path89;
    	let path90;
    	let path91;
    	let path92;
    	let path93;
    	let path94;
    	let path95;
    	let path96;
    	let path97;
    	let path98;
    	let path99;
    	let path100;
    	let path101;
    	let path102;
    	let path103;
    	let path104;
    	let path105;
    	let path106;
    	let path107;
    	let path108;
    	let path109;
    	let path110;
    	let path111;
    	let path112;
    	let path113;
    	let path114;
    	let path115;
    	let path116;
    	let path117;
    	let path118;
    	let path119;
    	let path120;
    	let path121;
    	let path122;
    	let path123;
    	let path124;
    	let path125;
    	let path126;
    	let path127;
    	let path128;
    	let path129;
    	let path130;
    	let path131;
    	let path132;
    	let path133;
    	let path134;
    	let path135;
    	let path136;
    	let path137;
    	let path138;
    	let path139;
    	let path140;
    	let path141;
    	let path142;
    	let path143;
    	let path144;
    	let path145;
    	let path146;
    	let path147;
    	let path148;
    	let path149;
    	let path150;
    	let path151;
    	let path152;
    	let path153;
    	let path154;
    	let path155;
    	let path156;
    	let path157;
    	let path158;
    	let path159;
    	let path160;
    	let path161;
    	let path162;
    	let path163;
    	let path164;
    	let path165;
    	let path166;
    	let path167;
    	let path168;
    	let path169;
    	let path170;
    	let path171;
    	let path172;
    	let path173;
    	let path174;
    	let path175;
    	let path176;
    	let path177;
    	let path178;
    	let path179;
    	let path180;
    	let path181;
    	let path182;
    	let path183;
    	let path184;
    	let path185;
    	let path186;
    	let path187;
    	let path188;
    	let path189;
    	let path190;
    	let path191;
    	let path192;
    	let path193;
    	let path194;
    	let path195;
    	let path196;
    	let path197;
    	let path198;
    	let path199;
    	let path200;
    	let path201;
    	let path202;
    	let path203;
    	let path204;
    	let path205;
    	let path206;
    	let path207;
    	let path208;
    	let path209;
    	let path210;
    	let path211;
    	let path212;
    	let path213;
    	let path214;
    	let path215;
    	let path216;
    	let path217;
    	let path218;
    	let path219;
    	let path220;
    	let path221;
    	let path222;
    	let path223;
    	let path224;
    	let path225;
    	let path226;
    	let path227;
    	let path228;
    	let path229;
    	let path230;
    	let path231;
    	let path232;
    	let path233;
    	let path234;
    	let path235;
    	let path236;
    	let path237;
    	let path238;
    	let path239;
    	let path240;
    	let path241;
    	let path242;
    	let path243;
    	let path244;
    	let path245;
    	let path246;
    	let path247;
    	let path248;
    	let path249;
    	let path250;
    	let path251;
    	let path252;
    	let path253;
    	let path254;
    	let path255;
    	let path256;
    	let path257;
    	let path258;
    	let path259;
    	let path260;
    	let path261;
    	let path262;
    	let path263;
    	let path264;
    	let path265;
    	let path266;
    	let path267;
    	let path268;
    	let path269;
    	let path270;
    	let path271;
    	let path272;
    	let path273;
    	let path274;
    	let path275;
    	let path276;
    	let path277;
    	let path278;
    	let path279;
    	let path280;
    	let path281;
    	let path282;
    	let path283;
    	let path284;
    	let path285;
    	let path286;
    	let path287;
    	let path288;
    	let path289;
    	let path290;
    	let path291;
    	let path292;
    	let path293;
    	let path294;
    	let path295;
    	let path296;
    	let path297;
    	let path298;
    	let path299;
    	let path300;
    	let path301;
    	let path302;
    	let path303;
    	let path304;
    	let path305;
    	let path306;
    	let path307;
    	let path308;
    	let path309;
    	let path310;
    	let path311;
    	let path312;
    	let path313;
    	let path314;
    	let path315;
    	let path316;
    	let path317;
    	let path318;
    	let path319;
    	let path320;
    	let path321;
    	let path322;
    	let path323;
    	let path324;
    	let path325;
    	let path326;
    	let path327;
    	let path328;
    	let path329;
    	let path330;
    	let path331;
    	let path332;
    	let path333;
    	let path334;
    	let path335;
    	let path336;
    	let path337;
    	let path338;
    	let path339;
    	let path340;
    	let path341;
    	let path342;
    	let path343;
    	let path344;
    	let path345;
    	let path346;
    	let path347;
    	let path348;
    	let path349;
    	let path350;
    	let path351;
    	let path352;
    	let path353;
    	let path354;
    	let path355;
    	let path356;
    	let path357;
    	let path358;
    	let path359;
    	let path360;
    	let path361;
    	let path362;
    	let path363;
    	let path364;
    	let path365;
    	let path366;
    	let path367;
    	let path368;
    	let path369;
    	let path370;
    	let path371;
    	let path372;
    	let path373;
    	let path374;
    	let path375;
    	let path376;
    	let path377;
    	let path378;
    	let path379;
    	let path380;
    	let path381;
    	let path382;
    	let path383;
    	let path384;
    	let path385;
    	let path386;
    	let path387;
    	let path388;
    	let path389;
    	let path390;
    	let path391;
    	let path392;
    	let path393;
    	let path394;
    	let path395;
    	let path396;
    	let path397;
    	let path398;
    	let path399;
    	let path400;
    	let path401;
    	let path402;
    	let path403;
    	let path404;
    	let path405;
    	let path406;
    	let path407;
    	let path408;
    	let path409;
    	let path410;
    	let path411;
    	let path412;
    	let path413;
    	let path414;
    	let path415;
    	let path416;
    	let path417;
    	let path418;
    	let path419;
    	let path420;
    	let path421;
    	let path422;
    	let path423;
    	let path424;
    	let path425;
    	let path426;
    	let path427;
    	let path428;
    	let path429;
    	let path430;
    	let path431;
    	let path432;
    	let path433;
    	let path434;
    	let path435;
    	let path436;
    	let path437;
    	let path438;
    	let path439;
    	let path440;
    	let path441;
    	let path442;
    	let path443;
    	let path444;
    	let path445;
    	let path446;
    	let path447;
    	let path448;
    	let path449;
    	let path450;
    	let path451;
    	let path452;
    	let path453;
    	let path454;
    	let path455;
    	let path456;
    	let path457;
    	let path458;
    	let path459;
    	let path460;
    	let path461;
    	let path462;
    	let path463;
    	let path464;
    	let path465;
    	let path466;
    	let path467;
    	let path468;
    	let path469;
    	let path470;
    	let path471;
    	let path472;
    	let path473;
    	let path474;
    	let path475;
    	let path476;
    	let path477;
    	let path478;
    	let path479;
    	let path480;
    	let path481;
    	let path482;
    	let path483;
    	let path484;
    	let path485;
    	let path486;
    	let path487;
    	let path488;
    	let path489;
    	let path490;
    	let path491;
    	let path492;
    	let path493;
    	let path494;
    	let path495;
    	let path496;
    	let path497;
    	let path498;
    	let path499;
    	let path500;
    	let path501;
    	let path502;
    	let path503;
    	let path504;
    	let path505;
    	let path506;
    	let path507;
    	let path508;
    	let path509;
    	let path510;
    	let path511;
    	let path512;
    	let path513;
    	let path514;
    	let path515;
    	let path516;
    	let path517;
    	let path518;
    	let path519;
    	let path520;
    	let path521;
    	let path522;
    	let path523;
    	let path524;
    	let path525;
    	let path526;
    	let path527;
    	let path528;
    	let path529;
    	let path530;
    	let path531;
    	let path532;
    	let path533;
    	let path534;
    	let path535;
    	let path536;
    	let path537;
    	let path538;
    	let path539;
    	let path540;
    	let path541;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			path21 = svg_element("path");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			path26 = svg_element("path");
    			path27 = svg_element("path");
    			path28 = svg_element("path");
    			path29 = svg_element("path");
    			path30 = svg_element("path");
    			path31 = svg_element("path");
    			path32 = svg_element("path");
    			path33 = svg_element("path");
    			path34 = svg_element("path");
    			path35 = svg_element("path");
    			path36 = svg_element("path");
    			path37 = svg_element("path");
    			path38 = svg_element("path");
    			path39 = svg_element("path");
    			path40 = svg_element("path");
    			path41 = svg_element("path");
    			path42 = svg_element("path");
    			path43 = svg_element("path");
    			path44 = svg_element("path");
    			path45 = svg_element("path");
    			path46 = svg_element("path");
    			path47 = svg_element("path");
    			path48 = svg_element("path");
    			path49 = svg_element("path");
    			path50 = svg_element("path");
    			path51 = svg_element("path");
    			path52 = svg_element("path");
    			path53 = svg_element("path");
    			path54 = svg_element("path");
    			path55 = svg_element("path");
    			path56 = svg_element("path");
    			path57 = svg_element("path");
    			path58 = svg_element("path");
    			path59 = svg_element("path");
    			path60 = svg_element("path");
    			path61 = svg_element("path");
    			path62 = svg_element("path");
    			path63 = svg_element("path");
    			path64 = svg_element("path");
    			path65 = svg_element("path");
    			path66 = svg_element("path");
    			path67 = svg_element("path");
    			path68 = svg_element("path");
    			path69 = svg_element("path");
    			path70 = svg_element("path");
    			path71 = svg_element("path");
    			path72 = svg_element("path");
    			path73 = svg_element("path");
    			path74 = svg_element("path");
    			path75 = svg_element("path");
    			path76 = svg_element("path");
    			path77 = svg_element("path");
    			path78 = svg_element("path");
    			path79 = svg_element("path");
    			path80 = svg_element("path");
    			path81 = svg_element("path");
    			path82 = svg_element("path");
    			path83 = svg_element("path");
    			path84 = svg_element("path");
    			path85 = svg_element("path");
    			path86 = svg_element("path");
    			path87 = svg_element("path");
    			path88 = svg_element("path");
    			path89 = svg_element("path");
    			path90 = svg_element("path");
    			path91 = svg_element("path");
    			path92 = svg_element("path");
    			path93 = svg_element("path");
    			path94 = svg_element("path");
    			path95 = svg_element("path");
    			path96 = svg_element("path");
    			path97 = svg_element("path");
    			path98 = svg_element("path");
    			path99 = svg_element("path");
    			path100 = svg_element("path");
    			path101 = svg_element("path");
    			path102 = svg_element("path");
    			path103 = svg_element("path");
    			path104 = svg_element("path");
    			path105 = svg_element("path");
    			path106 = svg_element("path");
    			path107 = svg_element("path");
    			path108 = svg_element("path");
    			path109 = svg_element("path");
    			path110 = svg_element("path");
    			path111 = svg_element("path");
    			path112 = svg_element("path");
    			path113 = svg_element("path");
    			path114 = svg_element("path");
    			path115 = svg_element("path");
    			path116 = svg_element("path");
    			path117 = svg_element("path");
    			path118 = svg_element("path");
    			path119 = svg_element("path");
    			path120 = svg_element("path");
    			path121 = svg_element("path");
    			path122 = svg_element("path");
    			path123 = svg_element("path");
    			path124 = svg_element("path");
    			path125 = svg_element("path");
    			path126 = svg_element("path");
    			path127 = svg_element("path");
    			path128 = svg_element("path");
    			path129 = svg_element("path");
    			path130 = svg_element("path");
    			path131 = svg_element("path");
    			path132 = svg_element("path");
    			path133 = svg_element("path");
    			path134 = svg_element("path");
    			path135 = svg_element("path");
    			path136 = svg_element("path");
    			path137 = svg_element("path");
    			path138 = svg_element("path");
    			path139 = svg_element("path");
    			path140 = svg_element("path");
    			path141 = svg_element("path");
    			path142 = svg_element("path");
    			path143 = svg_element("path");
    			path144 = svg_element("path");
    			path145 = svg_element("path");
    			path146 = svg_element("path");
    			path147 = svg_element("path");
    			path148 = svg_element("path");
    			path149 = svg_element("path");
    			path150 = svg_element("path");
    			path151 = svg_element("path");
    			path152 = svg_element("path");
    			path153 = svg_element("path");
    			path154 = svg_element("path");
    			path155 = svg_element("path");
    			path156 = svg_element("path");
    			path157 = svg_element("path");
    			path158 = svg_element("path");
    			path159 = svg_element("path");
    			path160 = svg_element("path");
    			path161 = svg_element("path");
    			path162 = svg_element("path");
    			path163 = svg_element("path");
    			path164 = svg_element("path");
    			path165 = svg_element("path");
    			path166 = svg_element("path");
    			path167 = svg_element("path");
    			path168 = svg_element("path");
    			path169 = svg_element("path");
    			path170 = svg_element("path");
    			path171 = svg_element("path");
    			path172 = svg_element("path");
    			path173 = svg_element("path");
    			path174 = svg_element("path");
    			path175 = svg_element("path");
    			path176 = svg_element("path");
    			path177 = svg_element("path");
    			path178 = svg_element("path");
    			path179 = svg_element("path");
    			path180 = svg_element("path");
    			path181 = svg_element("path");
    			path182 = svg_element("path");
    			path183 = svg_element("path");
    			path184 = svg_element("path");
    			path185 = svg_element("path");
    			path186 = svg_element("path");
    			path187 = svg_element("path");
    			path188 = svg_element("path");
    			path189 = svg_element("path");
    			path190 = svg_element("path");
    			path191 = svg_element("path");
    			path192 = svg_element("path");
    			path193 = svg_element("path");
    			path194 = svg_element("path");
    			path195 = svg_element("path");
    			path196 = svg_element("path");
    			path197 = svg_element("path");
    			path198 = svg_element("path");
    			path199 = svg_element("path");
    			path200 = svg_element("path");
    			path201 = svg_element("path");
    			path202 = svg_element("path");
    			path203 = svg_element("path");
    			path204 = svg_element("path");
    			path205 = svg_element("path");
    			path206 = svg_element("path");
    			path207 = svg_element("path");
    			path208 = svg_element("path");
    			path209 = svg_element("path");
    			path210 = svg_element("path");
    			path211 = svg_element("path");
    			path212 = svg_element("path");
    			path213 = svg_element("path");
    			path214 = svg_element("path");
    			path215 = svg_element("path");
    			path216 = svg_element("path");
    			path217 = svg_element("path");
    			path218 = svg_element("path");
    			path219 = svg_element("path");
    			path220 = svg_element("path");
    			path221 = svg_element("path");
    			path222 = svg_element("path");
    			path223 = svg_element("path");
    			path224 = svg_element("path");
    			path225 = svg_element("path");
    			path226 = svg_element("path");
    			path227 = svg_element("path");
    			path228 = svg_element("path");
    			path229 = svg_element("path");
    			path230 = svg_element("path");
    			path231 = svg_element("path");
    			path232 = svg_element("path");
    			path233 = svg_element("path");
    			path234 = svg_element("path");
    			path235 = svg_element("path");
    			path236 = svg_element("path");
    			path237 = svg_element("path");
    			path238 = svg_element("path");
    			path239 = svg_element("path");
    			path240 = svg_element("path");
    			path241 = svg_element("path");
    			path242 = svg_element("path");
    			path243 = svg_element("path");
    			path244 = svg_element("path");
    			path245 = svg_element("path");
    			path246 = svg_element("path");
    			path247 = svg_element("path");
    			path248 = svg_element("path");
    			path249 = svg_element("path");
    			path250 = svg_element("path");
    			path251 = svg_element("path");
    			path252 = svg_element("path");
    			path253 = svg_element("path");
    			path254 = svg_element("path");
    			path255 = svg_element("path");
    			path256 = svg_element("path");
    			path257 = svg_element("path");
    			path258 = svg_element("path");
    			path259 = svg_element("path");
    			path260 = svg_element("path");
    			path261 = svg_element("path");
    			path262 = svg_element("path");
    			path263 = svg_element("path");
    			path264 = svg_element("path");
    			path265 = svg_element("path");
    			path266 = svg_element("path");
    			path267 = svg_element("path");
    			path268 = svg_element("path");
    			path269 = svg_element("path");
    			path270 = svg_element("path");
    			path271 = svg_element("path");
    			path272 = svg_element("path");
    			path273 = svg_element("path");
    			path274 = svg_element("path");
    			path275 = svg_element("path");
    			path276 = svg_element("path");
    			path277 = svg_element("path");
    			path278 = svg_element("path");
    			path279 = svg_element("path");
    			path280 = svg_element("path");
    			path281 = svg_element("path");
    			path282 = svg_element("path");
    			path283 = svg_element("path");
    			path284 = svg_element("path");
    			path285 = svg_element("path");
    			path286 = svg_element("path");
    			path287 = svg_element("path");
    			path288 = svg_element("path");
    			path289 = svg_element("path");
    			path290 = svg_element("path");
    			path291 = svg_element("path");
    			path292 = svg_element("path");
    			path293 = svg_element("path");
    			path294 = svg_element("path");
    			path295 = svg_element("path");
    			path296 = svg_element("path");
    			path297 = svg_element("path");
    			path298 = svg_element("path");
    			path299 = svg_element("path");
    			path300 = svg_element("path");
    			path301 = svg_element("path");
    			path302 = svg_element("path");
    			path303 = svg_element("path");
    			path304 = svg_element("path");
    			path305 = svg_element("path");
    			path306 = svg_element("path");
    			path307 = svg_element("path");
    			path308 = svg_element("path");
    			path309 = svg_element("path");
    			path310 = svg_element("path");
    			path311 = svg_element("path");
    			path312 = svg_element("path");
    			path313 = svg_element("path");
    			path314 = svg_element("path");
    			path315 = svg_element("path");
    			path316 = svg_element("path");
    			path317 = svg_element("path");
    			path318 = svg_element("path");
    			path319 = svg_element("path");
    			path320 = svg_element("path");
    			path321 = svg_element("path");
    			path322 = svg_element("path");
    			path323 = svg_element("path");
    			path324 = svg_element("path");
    			path325 = svg_element("path");
    			path326 = svg_element("path");
    			path327 = svg_element("path");
    			path328 = svg_element("path");
    			path329 = svg_element("path");
    			path330 = svg_element("path");
    			path331 = svg_element("path");
    			path332 = svg_element("path");
    			path333 = svg_element("path");
    			path334 = svg_element("path");
    			path335 = svg_element("path");
    			path336 = svg_element("path");
    			path337 = svg_element("path");
    			path338 = svg_element("path");
    			path339 = svg_element("path");
    			path340 = svg_element("path");
    			path341 = svg_element("path");
    			path342 = svg_element("path");
    			path343 = svg_element("path");
    			path344 = svg_element("path");
    			path345 = svg_element("path");
    			path346 = svg_element("path");
    			path347 = svg_element("path");
    			path348 = svg_element("path");
    			path349 = svg_element("path");
    			path350 = svg_element("path");
    			path351 = svg_element("path");
    			path352 = svg_element("path");
    			path353 = svg_element("path");
    			path354 = svg_element("path");
    			path355 = svg_element("path");
    			path356 = svg_element("path");
    			path357 = svg_element("path");
    			path358 = svg_element("path");
    			path359 = svg_element("path");
    			path360 = svg_element("path");
    			path361 = svg_element("path");
    			path362 = svg_element("path");
    			path363 = svg_element("path");
    			path364 = svg_element("path");
    			path365 = svg_element("path");
    			path366 = svg_element("path");
    			path367 = svg_element("path");
    			path368 = svg_element("path");
    			path369 = svg_element("path");
    			path370 = svg_element("path");
    			path371 = svg_element("path");
    			path372 = svg_element("path");
    			path373 = svg_element("path");
    			path374 = svg_element("path");
    			path375 = svg_element("path");
    			path376 = svg_element("path");
    			path377 = svg_element("path");
    			path378 = svg_element("path");
    			path379 = svg_element("path");
    			path380 = svg_element("path");
    			path381 = svg_element("path");
    			path382 = svg_element("path");
    			path383 = svg_element("path");
    			path384 = svg_element("path");
    			path385 = svg_element("path");
    			path386 = svg_element("path");
    			path387 = svg_element("path");
    			path388 = svg_element("path");
    			path389 = svg_element("path");
    			path390 = svg_element("path");
    			path391 = svg_element("path");
    			path392 = svg_element("path");
    			path393 = svg_element("path");
    			path394 = svg_element("path");
    			path395 = svg_element("path");
    			path396 = svg_element("path");
    			path397 = svg_element("path");
    			path398 = svg_element("path");
    			path399 = svg_element("path");
    			path400 = svg_element("path");
    			path401 = svg_element("path");
    			path402 = svg_element("path");
    			path403 = svg_element("path");
    			path404 = svg_element("path");
    			path405 = svg_element("path");
    			path406 = svg_element("path");
    			path407 = svg_element("path");
    			path408 = svg_element("path");
    			path409 = svg_element("path");
    			path410 = svg_element("path");
    			path411 = svg_element("path");
    			path412 = svg_element("path");
    			path413 = svg_element("path");
    			path414 = svg_element("path");
    			path415 = svg_element("path");
    			path416 = svg_element("path");
    			path417 = svg_element("path");
    			path418 = svg_element("path");
    			path419 = svg_element("path");
    			path420 = svg_element("path");
    			path421 = svg_element("path");
    			path422 = svg_element("path");
    			path423 = svg_element("path");
    			path424 = svg_element("path");
    			path425 = svg_element("path");
    			path426 = svg_element("path");
    			path427 = svg_element("path");
    			path428 = svg_element("path");
    			path429 = svg_element("path");
    			path430 = svg_element("path");
    			path431 = svg_element("path");
    			path432 = svg_element("path");
    			path433 = svg_element("path");
    			path434 = svg_element("path");
    			path435 = svg_element("path");
    			path436 = svg_element("path");
    			path437 = svg_element("path");
    			path438 = svg_element("path");
    			path439 = svg_element("path");
    			path440 = svg_element("path");
    			path441 = svg_element("path");
    			path442 = svg_element("path");
    			path443 = svg_element("path");
    			path444 = svg_element("path");
    			path445 = svg_element("path");
    			path446 = svg_element("path");
    			path447 = svg_element("path");
    			path448 = svg_element("path");
    			path449 = svg_element("path");
    			path450 = svg_element("path");
    			path451 = svg_element("path");
    			path452 = svg_element("path");
    			path453 = svg_element("path");
    			path454 = svg_element("path");
    			path455 = svg_element("path");
    			path456 = svg_element("path");
    			path457 = svg_element("path");
    			path458 = svg_element("path");
    			path459 = svg_element("path");
    			path460 = svg_element("path");
    			path461 = svg_element("path");
    			path462 = svg_element("path");
    			path463 = svg_element("path");
    			path464 = svg_element("path");
    			path465 = svg_element("path");
    			path466 = svg_element("path");
    			path467 = svg_element("path");
    			path468 = svg_element("path");
    			path469 = svg_element("path");
    			path470 = svg_element("path");
    			path471 = svg_element("path");
    			path472 = svg_element("path");
    			path473 = svg_element("path");
    			path474 = svg_element("path");
    			path475 = svg_element("path");
    			path476 = svg_element("path");
    			path477 = svg_element("path");
    			path478 = svg_element("path");
    			path479 = svg_element("path");
    			path480 = svg_element("path");
    			path481 = svg_element("path");
    			path482 = svg_element("path");
    			path483 = svg_element("path");
    			path484 = svg_element("path");
    			path485 = svg_element("path");
    			path486 = svg_element("path");
    			path487 = svg_element("path");
    			path488 = svg_element("path");
    			path489 = svg_element("path");
    			path490 = svg_element("path");
    			path491 = svg_element("path");
    			path492 = svg_element("path");
    			path493 = svg_element("path");
    			path494 = svg_element("path");
    			path495 = svg_element("path");
    			path496 = svg_element("path");
    			path497 = svg_element("path");
    			path498 = svg_element("path");
    			path499 = svg_element("path");
    			path500 = svg_element("path");
    			path501 = svg_element("path");
    			path502 = svg_element("path");
    			path503 = svg_element("path");
    			path504 = svg_element("path");
    			path505 = svg_element("path");
    			path506 = svg_element("path");
    			path507 = svg_element("path");
    			path508 = svg_element("path");
    			path509 = svg_element("path");
    			path510 = svg_element("path");
    			path511 = svg_element("path");
    			path512 = svg_element("path");
    			path513 = svg_element("path");
    			path514 = svg_element("path");
    			path515 = svg_element("path");
    			path516 = svg_element("path");
    			path517 = svg_element("path");
    			path518 = svg_element("path");
    			path519 = svg_element("path");
    			path520 = svg_element("path");
    			path521 = svg_element("path");
    			path522 = svg_element("path");
    			path523 = svg_element("path");
    			path524 = svg_element("path");
    			path525 = svg_element("path");
    			path526 = svg_element("path");
    			path527 = svg_element("path");
    			path528 = svg_element("path");
    			path529 = svg_element("path");
    			path530 = svg_element("path");
    			path531 = svg_element("path");
    			path532 = svg_element("path");
    			path533 = svg_element("path");
    			path534 = svg_element("path");
    			path535 = svg_element("path");
    			path536 = svg_element("path");
    			path537 = svg_element("path");
    			path538 = svg_element("path");
    			path539 = svg_element("path");
    			path540 = svg_element("path");
    			path541 = svg_element("path");
    			attr_dev(path0, "fill", "#AA151B");
    			attr_dev(path0, "d", "M0 0h640v480H0z");
    			add_location(path0, file$c, 1, 1, 105);
    			attr_dev(path1, "fill", "#F1BF00");
    			attr_dev(path1, "d", "M0 120h640v240H0z");
    			add_location(path1, file$c, 2, 1, 150);
    			attr_dev(path2, "fill", "#ad1519");
    			attr_dev(path2, "d", "m127.3 213.3-.8-.1-1-1-.7-.4-.6-.8s-.7-1.1-.4-2c.3-.9.9-1.2 1.4-1.5a12 12 0 0 1 1.5-.5l1-.4 1.3-.3.5-.3c.2 0 .7 0 1-.2l1-.2 1.6.1h4.8c.4 0 1.2.3 1.4.4a35 35 0 0 0 2 .7c.5.1 1.6.3 2.2.6.5.3.9.7 1.1 1l.5 1v1.1l-.5.8-.6 1-.8.6s-.5.5-1 .4c-.4 0-4.8-.8-7.6-.8s-7.3.9-7.3.9");
    			add_location(path2, file$c, 3, 1, 197);
    			attr_dev(path3, "fill", "none");
    			attr_dev(path3, "stroke", "#000");
    			attr_dev(path3, "stroke-linejoin", "round");
    			attr_dev(path3, "stroke-width", ".3");
    			attr_dev(path3, "d", "m127.3 213.3-.8-.1-1-1-.7-.4-.6-.8s-.7-1.1-.4-2c.3-.9.9-1.2 1.4-1.5a12 12 0 0 1 1.5-.5l1-.4 1.3-.3.5-.3c.2 0 .7 0 1-.2l1-.2 1.6.1h4.8c.4 0 1.2.3 1.4.4a35 35 0 0 0 2 .7c.5.1 1.6.3 2.2.6.5.3.9.7 1.1 1l.5 1v1.1l-.5.8-.6 1-.8.6s-.5.5-1 .4c-.4 0-4.8-.8-7.6-.8s-7.3.9-7.3.9z");
    			add_location(path3, file$c, 7, 1, 499);
    			attr_dev(path4, "fill", "#c8b100");
    			attr_dev(path4, "d", "M133.3 207c0-1.3.6-2.3 1.3-2.3.8 0 1.4 1 1.4 2.4 0 1.3-.6 2.4-1.4 2.4s-1.3-1.1-1.3-2.5");
    			add_location(path4, file$c, 14, 1, 861);
    			attr_dev(path5, "fill", "none");
    			attr_dev(path5, "stroke", "#000");
    			attr_dev(path5, "stroke-width", ".3");
    			attr_dev(path5, "d", "M133.3 207c0-1.3.6-2.3 1.3-2.3.8 0 1.4 1 1.4 2.4 0 1.3-.6 2.4-1.4 2.4s-1.3-1.1-1.3-2.5z");
    			add_location(path5, file$c, 18, 1, 982);
    			attr_dev(path6, "fill", "#c8b100");
    			attr_dev(path6, "d", "M134 207c0-1.2.3-2.1.7-2.1.3 0 .6 1 .6 2.1 0 1.3-.3 2.2-.6 2.2-.4 0-.6-1-.6-2.2");
    			add_location(path6, file$c, 24, 1, 1137);
    			attr_dev(path7, "fill", "none");
    			attr_dev(path7, "stroke", "#000");
    			attr_dev(path7, "stroke-width", ".3");
    			attr_dev(path7, "d", "M134 207c0-1.2.3-2.1.7-2.1.3 0 .6 1 .6 2.1 0 1.3-.3 2.2-.6 2.2-.4 0-.6-1-.6-2.2z");
    			add_location(path7, file$c, 25, 1, 1246);
    			attr_dev(path8, "fill", "#c8b100");
    			attr_dev(path8, "d", "M133.8 204.5c0-.4.4-.8.8-.8s1 .4 1 .8c0 .5-.5.9-1 .9s-.8-.4-.8-.9");
    			add_location(path8, file$c, 31, 1, 1394);
    			attr_dev(path9, "fill", "#c8b100");
    			attr_dev(path9, "d", "M135.3 204.2v.6h-1.4v-.6h.5V203h-.7v-.6h.7v-.5h.5v.5h.6v.6h-.6v1.2h.4");
    			add_location(path9, file$c, 32, 1, 1489);
    			attr_dev(path10, "fill", "none");
    			attr_dev(path10, "stroke", "#000");
    			attr_dev(path10, "stroke-width", ".3");
    			attr_dev(path10, "d", "M135.3 204.2v.6h-1.4v-.6h.5V203h-.7v-.6h.7v-.5h.5v.5h.6v.6h-.6v1.2h.4");
    			add_location(path10, file$c, 33, 1, 1588);
    			attr_dev(path11, "fill", "#c8b100");
    			attr_dev(path11, "d", "M135.9 204.2v.6h-2.5v-.6h1V203h-.7v-.6h.7v-.5h.5v.5h.6v.6h-.6v1.2h1");
    			add_location(path11, file$c, 39, 1, 1725);
    			attr_dev(path12, "fill", "none");
    			attr_dev(path12, "stroke", "#000");
    			attr_dev(path12, "stroke-width", ".3");
    			attr_dev(path12, "d", "M135.9 204.2v.6h-2.5v-.6h1V203h-.7v-.6h.7v-.5h.5v.5h.6v.6h-.6v1.2h1");
    			add_location(path12, file$c, 40, 1, 1822);
    			attr_dev(path13, "fill", "none");
    			attr_dev(path13, "stroke", "#000");
    			attr_dev(path13, "stroke-width", ".3");
    			attr_dev(path13, "d", "M134.9 203.7c.4.1.6.4.6.8 0 .5-.4.9-.8.9s-1-.4-1-.9c0-.4.3-.7.7-.8");
    			add_location(path13, file$c, 46, 1, 1957);
    			attr_dev(path14, "fill", "#c8b100");
    			attr_dev(path14, "d", "M134.7 213.2H130v-1.1l-.3-1.2-.2-1.5c-1.3-1.7-2.5-2.8-2.9-2.5.1-.3.2-.6.5-.7 1.1-.7 3.5 1 5.2 3.6l.5.7h3.8l.4-.7c1.8-2.7 4.1-4.3 5.2-3.6.3.1.4.4.5.7-.4-.3-1.6.8-2.9 2.5l-.2 1.5-.2 1.2-.1 1.1h-4.7");
    			add_location(path14, file$c, 52, 1, 2091);
    			attr_dev(path15, "fill", "none");
    			attr_dev(path15, "stroke", "#000");
    			attr_dev(path15, "stroke-width", ".3");
    			attr_dev(path15, "d", "M134.7 213.2H130v-1.1l-.3-1.2-.2-1.5c-1.3-1.7-2.5-2.8-2.9-2.5.1-.3.2-.6.5-.7 1.1-.7 3.5 1 5.2 3.6l.5.7h3.8l.4-.7c1.8-2.7 4.1-4.3 5.2-3.6.3.1.4.4.5.7-.4-.3-1.6.8-2.9 2.5l-.2 1.5-.2 1.2-.1 1.1h-4.7z");
    			add_location(path15, file$c, 56, 1, 2321);
    			attr_dev(path16, "fill", "none");
    			attr_dev(path16, "stroke", "#000");
    			attr_dev(path16, "stroke-width", ".3");
    			attr_dev(path16, "d", "M126.8 206.8c1-.5 3 1.1 4.6 3.6m11-3.6c-.8-.5-2.8 1.1-4.5 3.6");
    			add_location(path16, file$c, 62, 1, 2585);
    			attr_dev(path17, "fill", "#c8b100");
    			attr_dev(path17, "d", "m127.8 215.3-.5-1a27.3 27.3 0 0 1 14.7 0l-.5.8a5.7 5.7 0 0 0-.3.8 22.9 22.9 0 0 0-6.6-.8c-2.6 0-5.2.3-6.5.8l-.3-.6");
    			add_location(path17, file$c, 68, 1, 2714);
    			attr_dev(path18, "fill", "none");
    			attr_dev(path18, "stroke", "#000");
    			attr_dev(path18, "stroke-width", ".3");
    			attr_dev(path18, "d", "m127.8 215.3-.5-1a27.3 27.3 0 0 1 14.7 0l-.5.8a5.7 5.7 0 0 0-.3.8 22.9 22.9 0 0 0-6.6-.8c-2.6 0-5.2.3-6.5.8l-.3-.6");
    			add_location(path18, file$c, 72, 1, 2863);
    			attr_dev(path19, "fill", "#c8b100");
    			attr_dev(path19, "d", "M134.6 217.7c2.4 0 5-.4 5.9-.6.6-.2 1-.5 1-.8 0-.2-.2-.3-.4-.4-1.4-.5-4-.8-6.5-.8s-5 .3-6.4.8c-.2 0-.3.2-.4.3 0 .4.3.7 1 .9 1 .2 3.5.6 5.8.6");
    			add_location(path19, file$c, 78, 1, 3045);
    			attr_dev(path20, "fill", "none");
    			attr_dev(path20, "stroke", "#000");
    			attr_dev(path20, "stroke-width", ".3");
    			attr_dev(path20, "d", "M134.6 217.7c2.4 0 5-.4 5.9-.6.6-.2 1-.5 1-.8 0-.2-.2-.3-.4-.4-1.4-.5-4-.8-6.5-.8s-5 .3-6.4.8c-.2 0-.3.2-.4.3 0 .4.3.7 1 .9 1 .2 3.5.6 5.8.6z");
    			add_location(path20, file$c, 82, 1, 3220);
    			attr_dev(path21, "fill", "#c8b100");
    			attr_dev(path21, "d", "m142.1 213.2-.5-.5s-.6.3-1.3.2c-.6 0-.9-1-.9-1s-.7.7-1.3.7c-.7 0-1-.6-1-.6s-.7.5-1.3.4c-.6 0-1.2-.8-1.2-.8s-.6.8-1.2.8c-.6.1-1-.5-1-.5s-.4.6-1.1.7-1.4-.6-1.4-.6-.5.7-1 1c-.5 0-1.2-.4-1.2-.4l-.2.5-.3.1.2.5a27 27 0 0 1 7.2-.9c3 0 5.5.4 7.4 1l.2-.6");
    			add_location(path21, file$c, 88, 1, 3429);
    			attr_dev(path22, "fill", "none");
    			attr_dev(path22, "stroke", "#000");
    			attr_dev(path22, "stroke-width", ".3");
    			attr_dev(path22, "d", "m142.1 213.2-.5-.5s-.6.3-1.3.2c-.6 0-.9-1-.9-1s-.7.7-1.3.7c-.7 0-1-.6-1-.6s-.7.5-1.3.4c-.6 0-1.2-.8-1.2-.8s-.6.8-1.2.8c-.6.1-1-.5-1-.5s-.4.6-1.1.7-1.4-.6-1.4-.6-.5.7-1 1c-.5 0-1.2-.4-1.2-.4l-.2.5-.3.1.2.5a27 27 0 0 1 7.2-.9c3 0 5.5.4 7.4 1l.2-.6z");
    			add_location(path22, file$c, 92, 1, 3709);
    			attr_dev(path23, "fill", "#c8b100");
    			attr_dev(path23, "d", "M134.7 210.7h.2a1 1 0 0 0 0 .4c0 .6.4 1 1 1a1 1 0 0 0 1-.7l.2-.3v.4c.1.5.6.8 1.1.8.6 0 1-.4 1-1v-.1l.4-.4.2.5a.9.9 0 0 0-.1.4 1 1 0 0 0 1 1c.4 0 .7-.2.9-.5l.2-.2v.3c0 .3.1.6.4.7 0 0 .4 0 1-.4l.7-.7v.4s-.5.8-1 1c-.2.2-.5.4-.8.3-.3 0-.6-.3-.7-.6-.2.2-.4.2-.7.2-.6 0-1.2-.3-1.4-.8-.3.3-.7.5-1.1.5a1.6 1.6 0 0 1-1.2-.6 1.6 1.6 0 0 1-1 .4 1.6 1.6 0 0 1-1.3-.6 1.6 1.6 0 0 1-2.4.2 1.6 1.6 0 0 1-1.2.6 1.5 1.5 0 0 1-1.1-.5c-.2.5-.8.8-1.4.8-.2 0-.5 0-.7-.2-.1.3-.4.6-.7.6-.3 0-.6 0-.9-.2l-1-1 .1-.5.8.7c.5.4.9.4.9.4.3 0 .4-.4.4-.7v-.3l.2.2c.2.3.5.5.9.5a1 1 0 0 0 1-1 .9.9 0 0 0 0-.4v-.5l.4.4a.7.7 0 0 0 0 .1c0 .6.5 1 1 1 .6 0 1-.3 1.1-.9v-.3l.2.3c.2.4.6.7 1 .7.7 0 1.1-.4 1.1-1a1 1 0 0 0 0-.3h.3");
    			add_location(path23, file$c, 98, 1, 4023);
    			attr_dev(path24, "fill", "none");
    			attr_dev(path24, "stroke", "#000");
    			attr_dev(path24, "stroke-width", ".3");
    			attr_dev(path24, "d", "M134.7 210.7h.2a1 1 0 0 0 0 .4c0 .6.4 1 1 1a1 1 0 0 0 1-.7l.2-.3v.4c.1.5.6.8 1.1.8.6 0 1-.4 1-1v-.1l.4-.4.2.5a.9.9 0 0 0-.1.4 1 1 0 0 0 1 1c.4 0 .7-.2.9-.5l.2-.2v.3c0 .3.1.6.4.7 0 0 .4 0 1-.4l.7-.7v.4s-.5.8-1 1c-.2.2-.5.4-.8.3-.3 0-.6-.3-.7-.6-.2.2-.4.2-.7.2-.6 0-1.2-.3-1.4-.8-.3.3-.7.5-1.1.5a1.6 1.6 0 0 1-1.2-.6 1.6 1.6 0 0 1-1 .4 1.6 1.6 0 0 1-1.3-.6 1.6 1.6 0 0 1-2.4.2 1.6 1.6 0 0 1-1.2.6 1.5 1.5 0 0 1-1.1-.5c-.2.5-.8.8-1.4.8-.2 0-.5 0-.7-.2-.1.3-.4.6-.7.6-.3 0-.6 0-.9-.2l-1-1 .1-.5.8.7c.5.4.9.4.9.4.3 0 .4-.4.4-.7v-.3l.2.2c.2.3.5.5.9.5a1 1 0 0 0 1-1 .9.9 0 0 0 0-.4v-.5l.4.4a.7.7 0 0 0 0 .1c0 .6.5 1 1 1 .6 0 1-.3 1.1-.9v-.3l.2.3c.2.4.6.7 1 .7.7 0 1.1-.4 1.1-1a1 1 0 0 0 0-.3h.3z");
    			add_location(path24, file$c, 102, 1, 4745);
    			attr_dev(path25, "fill", "#c8b100");
    			attr_dev(path25, "d", "M134.6 213.3c-2.9 0-5.5.4-7.3 1l-.3-.2.1-.3a27 27 0 0 1 7.5-1c3 0 5.7.4 7.6 1 0 0 .2.2.1.3l-.3.2a27.3 27.3 0 0 0-7.4-1");
    			add_location(path25, file$c, 108, 1, 5501);
    			attr_dev(path26, "fill", "none");
    			attr_dev(path26, "stroke", "#000");
    			attr_dev(path26, "stroke-linejoin", "round");
    			attr_dev(path26, "stroke-width", ".3");
    			attr_dev(path26, "d", "M134.6 213.3c-2.9 0-5.5.4-7.3 1l-.3-.2.1-.3a27 27 0 0 1 7.5-1c3 0 5.7.4 7.6 1 0 0 .2.2.1.3l-.3.2a27.3 27.3 0 0 0-7.4-1z");
    			add_location(path26, file$c, 112, 1, 5654);
    			attr_dev(path27, "fill", "#fff");
    			attr_dev(path27, "d", "M131.8 214.4c0-.3.2-.4.5-.4a.4.4 0 0 1 .4.4c0 .2-.2.4-.4.4a.4.4 0 0 1-.5-.4");
    			add_location(path27, file$c, 119, 1, 5867);
    			attr_dev(path28, "fill", "none");
    			attr_dev(path28, "stroke", "#000");
    			attr_dev(path28, "stroke-width", ".3");
    			attr_dev(path28, "d", "M131.8 214.4c0-.3.2-.4.5-.4a.4.4 0 0 1 .4.4c0 .2-.2.4-.4.4a.4.4 0 0 1-.5-.4z");
    			add_location(path28, file$c, 120, 1, 5969);
    			attr_dev(path29, "fill", "#ad1519");
    			attr_dev(path29, "d", "M134.7 214.5h-1c-.1 0-.3 0-.3-.3l.3-.3h2a.3.3 0 0 1 .2.3.3.3 0 0 1-.3.3h-1");
    			add_location(path29, file$c, 126, 1, 6113);
    			attr_dev(path30, "fill", "none");
    			attr_dev(path30, "stroke", "#000");
    			attr_dev(path30, "stroke-width", ".3");
    			attr_dev(path30, "d", "M134.7 214.5h-1c-.1 0-.3 0-.3-.3l.3-.3h2a.3.3 0 0 1 .2.3.3.3 0 0 1-.3.3h-1");
    			add_location(path30, file$c, 127, 1, 6217);
    			attr_dev(path31, "fill", "#058e6e");
    			attr_dev(path31, "d", "M130 214.9h-.7c-.1 0-.3 0-.3-.2a.3.3 0 0 1 .2-.3l.7-.1.7-.1c.2 0 .3 0 .4.2a.3.3 0 0 1-.3.4h-.7");
    			add_location(path31, file$c, 133, 1, 6359);
    			attr_dev(path32, "fill", "none");
    			attr_dev(path32, "stroke", "#000");
    			attr_dev(path32, "stroke-width", ".3");
    			attr_dev(path32, "d", "M130 214.9h-.7c-.1 0-.3 0-.3-.2a.3.3 0 0 1 .2-.3l.7-.1.7-.1c.2 0 .3 0 .4.2a.3.3 0 0 1-.3.4h-.7");
    			add_location(path32, file$c, 137, 1, 6488);
    			attr_dev(path33, "fill", "#ad1519");
    			attr_dev(path33, "d", "m127.3 215.3.3-.4h.7l-.4.6-.6-.2");
    			add_location(path33, file$c, 143, 1, 6650);
    			attr_dev(path34, "fill", "none");
    			attr_dev(path34, "stroke", "#000");
    			attr_dev(path34, "stroke-width", ".3");
    			attr_dev(path34, "d", "m127.3 215.3.3-.4h.7l-.4.6-.6-.2");
    			add_location(path34, file$c, 144, 1, 6712);
    			attr_dev(path35, "fill", "#fff");
    			attr_dev(path35, "d", "M136.6 214.4c0-.3.2-.4.4-.4a.4.4 0 0 1 .5.4.4.4 0 0 1-.5.4.4.4 0 0 1-.4-.4");
    			add_location(path35, file$c, 145, 1, 6803);
    			attr_dev(path36, "fill", "none");
    			attr_dev(path36, "stroke", "#000");
    			attr_dev(path36, "stroke-width", ".3");
    			attr_dev(path36, "d", "M136.6 214.4c0-.3.2-.4.4-.4a.4.4 0 0 1 .5.4.4.4 0 0 1-.5.4.4.4 0 0 1-.4-.4z");
    			add_location(path36, file$c, 146, 1, 6904);
    			attr_dev(path37, "fill", "#058e6e");
    			attr_dev(path37, "d", "M139.3 214.9h.6a.3.3 0 0 0 .4-.2.3.3 0 0 0-.3-.3l-.6-.1-.7-.1c-.2 0-.3 0-.4.2 0 .2.1.3.3.4h.7");
    			add_location(path37, file$c, 152, 1, 7047);
    			attr_dev(path38, "fill", "none");
    			attr_dev(path38, "stroke", "#000");
    			attr_dev(path38, "stroke-width", ".3");
    			attr_dev(path38, "d", "M139.3 214.9h.6a.3.3 0 0 0 .4-.2.3.3 0 0 0-.3-.3l-.6-.1-.7-.1c-.2 0-.3 0-.4.2 0 .2.1.3.3.4h.7");
    			add_location(path38, file$c, 156, 1, 7175);
    			attr_dev(path39, "fill", "#ad1519");
    			attr_dev(path39, "d", "m142 215.4-.3-.5h-.7l.3.6.6-.1");
    			add_location(path39, file$c, 162, 1, 7336);
    			attr_dev(path40, "fill", "none");
    			attr_dev(path40, "stroke", "#000");
    			attr_dev(path40, "stroke-width", ".3");
    			attr_dev(path40, "d", "m142 215.4-.3-.5h-.7l.3.6.6-.1");
    			add_location(path40, file$c, 163, 1, 7396);
    			attr_dev(path41, "fill", "#ad1519");
    			attr_dev(path41, "d", "M134.6 217.1a25 25 0 0 1-6-.6 25.5 25.5 0 0 1 12.1 0c-1.6.4-3.7.6-6 .6");
    			add_location(path41, file$c, 164, 1, 7485);
    			attr_dev(path42, "fill", "none");
    			attr_dev(path42, "stroke", "#000");
    			attr_dev(path42, "stroke-linejoin", "round");
    			attr_dev(path42, "stroke-width", ".3");
    			attr_dev(path42, "d", "M134.6 217.1a25 25 0 0 1-6-.6 25.5 25.5 0 0 1 12.1 0c-1.6.4-3.7.6-6 .6z");
    			add_location(path42, file$c, 165, 1, 7585);
    			attr_dev(path43, "fill", "#c8b100");
    			attr_dev(path43, "d", "m142 212-.1-.3c-.2 0-.3 0-.4.2 0 .2 0 .4.2.4 0 0 .2 0 .3-.3");
    			add_location(path43, file$c, 172, 1, 7750);
    			attr_dev(path44, "fill", "none");
    			attr_dev(path44, "stroke", "#000");
    			attr_dev(path44, "stroke-width", ".3");
    			attr_dev(path44, "d", "m142 212-.1-.3c-.2 0-.3 0-.4.2 0 .2 0 .4.2.4 0 0 .2 0 .3-.3z");
    			add_location(path44, file$c, 173, 1, 7839);
    			attr_dev(path45, "fill", "#c8b100");
    			attr_dev(path45, "d", "M137.3 211.2c0-.2 0-.4-.2-.4 0 0-.2.1-.2.3 0 .2 0 .4.2.4l.3-.3");
    			add_location(path45, file$c, 179, 1, 7967);
    			attr_dev(path46, "fill", "none");
    			attr_dev(path46, "stroke", "#000");
    			attr_dev(path46, "stroke-width", ".3");
    			attr_dev(path46, "d", "M137.3 211.2c0-.2 0-.4-.2-.4 0 0-.2.1-.2.3 0 .2 0 .4.2.4l.3-.3z");
    			add_location(path46, file$c, 180, 1, 8059);
    			attr_dev(path47, "fill", "#c8b100");
    			attr_dev(path47, "d", "m132 211.2.1-.4c.2 0 .3.1.3.3 0 .2 0 .4-.2.4l-.2-.3");
    			add_location(path47, file$c, 186, 1, 8190);
    			attr_dev(path48, "fill", "none");
    			attr_dev(path48, "stroke", "#000");
    			attr_dev(path48, "stroke-width", ".3");
    			attr_dev(path48, "d", "m132 211.2.1-.4c.2 0 .3.1.3.3 0 .2 0 .4-.2.4l-.2-.3z");
    			add_location(path48, file$c, 187, 1, 8271);
    			attr_dev(path49, "fill", "#c8b100");
    			attr_dev(path49, "d", "m127.3 212 .1-.3c.2 0 .3 0 .4.2 0 .2 0 .4-.2.4 0 0-.2 0-.3-.3");
    			add_location(path49, file$c, 193, 1, 8391);
    			attr_dev(path50, "fill", "none");
    			attr_dev(path50, "stroke", "#000");
    			attr_dev(path50, "stroke-width", ".3");
    			attr_dev(path50, "d", "m127.3 212 .1-.3c.2 0 .3 0 .4.2 0 .2 0 .4-.2.4 0 0-.2 0-.3-.3z");
    			add_location(path50, file$c, 194, 1, 8482);
    			attr_dev(path51, "fill", "#c8b100");
    			attr_dev(path51, "d", "m134.6 208.5-.8.5.6 1.3.2.1.2-.1.7-1.3-.9-.5");
    			add_location(path51, file$c, 200, 1, 8612);
    			attr_dev(path52, "fill", "none");
    			attr_dev(path52, "stroke", "#000");
    			attr_dev(path52, "stroke-width", ".3");
    			attr_dev(path52, "d", "m134.6 208.5-.8.5.6 1.3.2.1.2-.1.7-1.3-.9-.5");
    			add_location(path52, file$c, 201, 1, 8686);
    			attr_dev(path53, "fill", "#c8b100");
    			attr_dev(path53, "d", "m132.8 210.5.4.5 1.3-.4.1-.2-.1-.2-1.3-.3-.4.6");
    			add_location(path53, file$c, 202, 1, 8789);
    			attr_dev(path54, "fill", "none");
    			attr_dev(path54, "stroke", "#000");
    			attr_dev(path54, "stroke-width", ".3");
    			attr_dev(path54, "d", "m132.8 210.5.4.5 1.3-.4.1-.2-.1-.2-1.3-.3-.4.6");
    			add_location(path54, file$c, 203, 1, 8865);
    			attr_dev(path55, "fill", "#c8b100");
    			attr_dev(path55, "d", "m136.4 210.5-.3.5-1.3-.4-.2-.2.2-.2 1.3-.3.3.6");
    			add_location(path55, file$c, 204, 1, 8970);
    			attr_dev(path56, "fill", "none");
    			attr_dev(path56, "stroke", "#000");
    			attr_dev(path56, "stroke-width", ".3");
    			attr_dev(path56, "d", "m136.4 210.5-.3.5-1.3-.4-.2-.2.2-.2 1.3-.3.3.6");
    			add_location(path56, file$c, 205, 1, 9046);
    			attr_dev(path57, "fill", "#c8b100");
    			attr_dev(path57, "d", "m129.3 209-.7.7.9 1 .2.1.1-.1.3-1.3-.8-.3");
    			add_location(path57, file$c, 206, 1, 9151);
    			attr_dev(path58, "fill", "none");
    			attr_dev(path58, "stroke", "#000");
    			attr_dev(path58, "stroke-width", ".3");
    			attr_dev(path58, "d", "m129.3 209-.7.7.9 1 .2.1.1-.1.3-1.3-.8-.3");
    			add_location(path58, file$c, 207, 1, 9222);
    			attr_dev(path59, "fill", "#c8b100");
    			attr_dev(path59, "d", "m128 211.2.4.5 1.2-.6v-.2l-.1-.2-1.3-.1-.3.6");
    			add_location(path59, file$c, 208, 1, 9322);
    			attr_dev(path60, "fill", "none");
    			attr_dev(path60, "stroke", "#000");
    			attr_dev(path60, "stroke-width", ".3");
    			attr_dev(path60, "d", "m128 211.2.4.5 1.2-.6v-.2l-.1-.2-1.3-.1-.3.6");
    			add_location(path60, file$c, 209, 1, 9396);
    			attr_dev(path61, "fill", "#c8b100");
    			attr_dev(path61, "d", "m131.5 210.5-.3.6H130l-.2-.2.1-.3 1.2-.6.5.5");
    			add_location(path61, file$c, 210, 1, 9499);
    			attr_dev(path62, "fill", "none");
    			attr_dev(path62, "stroke", "#000");
    			attr_dev(path62, "stroke-width", ".3");
    			attr_dev(path62, "d", "m131.5 210.5-.3.6H130l-.2-.2.1-.3 1.2-.6.5.5");
    			add_location(path62, file$c, 211, 1, 9573);
    			attr_dev(path63, "fill", "#c8b100");
    			attr_dev(path63, "d", "M126.6 211.4v.6l-1.4.2-.2-.1v-.2l1-.9.6.4");
    			add_location(path63, file$c, 212, 1, 9676);
    			attr_dev(path64, "fill", "none");
    			attr_dev(path64, "stroke", "#000");
    			attr_dev(path64, "stroke-width", ".3");
    			attr_dev(path64, "d", "M126.6 211.4v.6l-1.4.2-.2-.1v-.2l1-.9.6.4");
    			add_location(path64, file$c, 213, 1, 9747);
    			attr_dev(path65, "fill", "#c8b100");
    			attr_dev(path65, "d", "M129.2 210.9c0-.3.2-.5.5-.5s.5.2.5.5a.5.5 0 0 1-.5.4.5.5 0 0 1-.5-.4");
    			add_location(path65, file$c, 214, 1, 9847);
    			attr_dev(path66, "fill", "none");
    			attr_dev(path66, "stroke", "#000");
    			attr_dev(path66, "stroke-width", ".3");
    			attr_dev(path66, "d", "M129.2 210.9c0-.3.2-.5.5-.5s.5.2.5.5a.5.5 0 0 1-.5.4.5.5 0 0 1-.5-.4z");
    			add_location(path66, file$c, 215, 1, 9945);
    			attr_dev(path67, "fill", "#c8b100");
    			attr_dev(path67, "d", "m140 209 .7.7-.9 1-.2.1-.1-.1-.3-1.3.8-.3");
    			add_location(path67, file$c, 221, 1, 10082);
    			attr_dev(path68, "fill", "none");
    			attr_dev(path68, "stroke", "#000");
    			attr_dev(path68, "stroke-width", ".3");
    			attr_dev(path68, "d", "m140 209 .7.7-.9 1-.2.1-.1-.1-.3-1.3.8-.3");
    			add_location(path68, file$c, 222, 1, 10153);
    			attr_dev(path69, "fill", "#c8b100");
    			attr_dev(path69, "d", "m141.4 211.2-.5.5-1.2-.6v-.2l.1-.2 1.3-.1.3.6");
    			add_location(path69, file$c, 223, 1, 10253);
    			attr_dev(path70, "fill", "none");
    			attr_dev(path70, "stroke", "#000");
    			attr_dev(path70, "stroke-width", ".3");
    			attr_dev(path70, "d", "m141.4 211.2-.5.5-1.2-.6v-.2l.1-.2 1.3-.1.3.6");
    			add_location(path70, file$c, 224, 1, 10328);
    			attr_dev(path71, "fill", "#c8b100");
    			attr_dev(path71, "d", "m137.8 210.5.3.6h1.3l.2-.2-.1-.3-1.2-.6-.5.5");
    			add_location(path71, file$c, 225, 1, 10432);
    			attr_dev(path72, "fill", "none");
    			attr_dev(path72, "stroke", "#000");
    			attr_dev(path72, "stroke-width", ".3");
    			attr_dev(path72, "d", "m137.8 210.5.3.6h1.3l.2-.2-.1-.3-1.2-.6-.5.5");
    			add_location(path72, file$c, 226, 1, 10506);
    			attr_dev(path73, "fill", "#c8b100");
    			attr_dev(path73, "d", "m142.5 211.4.1.6 1.3.2.2-.1v-.2l-1-.9-.6.4");
    			add_location(path73, file$c, 227, 1, 10609);
    			attr_dev(path74, "fill", "none");
    			attr_dev(path74, "stroke", "#000");
    			attr_dev(path74, "stroke-width", ".3");
    			attr_dev(path74, "d", "m142.5 211.4.1.6 1.3.2.2-.1v-.2l-1-.9-.6.4");
    			add_location(path74, file$c, 228, 1, 10681);
    			attr_dev(path75, "fill", "#c8b100");
    			attr_dev(path75, "d", "M134.2 210.4a.5.5 0 0 1 .4-.4c.3 0 .5.2.5.4a.5.5 0 0 1-.5.5.5.5 0 0 1-.4-.5");
    			add_location(path75, file$c, 229, 1, 10782);
    			attr_dev(path76, "fill", "none");
    			attr_dev(path76, "stroke", "#000");
    			attr_dev(path76, "stroke-width", ".3");
    			attr_dev(path76, "d", "M134.2 210.4a.5.5 0 0 1 .4-.4c.3 0 .5.2.5.4a.5.5 0 0 1-.5.5.5.5 0 0 1-.4-.5z");
    			add_location(path76, file$c, 230, 1, 10887);
    			attr_dev(path77, "fill", "#c8b100");
    			attr_dev(path77, "d", "M139.1 210.9c0-.3.3-.5.5-.5a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.4.5.5 0 0 1-.5-.4");
    			add_location(path77, file$c, 236, 1, 11031);
    			attr_dev(path78, "fill", "none");
    			attr_dev(path78, "stroke", "#000");
    			attr_dev(path78, "stroke-width", ".3");
    			attr_dev(path78, "d", "M139.1 210.9c0-.3.3-.5.5-.5a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.4.5.5 0 0 1-.5-.4z");
    			add_location(path78, file$c, 237, 1, 11135);
    			attr_dev(path79, "fill", "#c8b100");
    			attr_dev(path79, "d", "m124.8 212.2-.6-.7c-.2-.2-.7-.3-.7-.3 0-.1.3-.3.6-.3a.5.5 0 0 1 .4.2v-.2s.3 0 .4.3v1");
    			add_location(path79, file$c, 243, 1, 11278);
    			attr_dev(path80, "fill", "none");
    			attr_dev(path80, "stroke", "#000");
    			attr_dev(path80, "stroke-width", ".3");
    			attr_dev(path80, "d", "m124.8 212.2-.6-.7c-.2-.2-.7-.3-.7-.3 0-.1.3-.3.6-.3a.5.5 0 0 1 .4.2v-.2s.3 0 .4.3v1z");
    			add_location(path80, file$c, 247, 1, 11397);
    			attr_dev(path81, "fill", "#c8b100");
    			attr_dev(path81, "d", "M124.8 212c.1-.2.4-.2.5 0 .2.1.3.3.2.5l-.5-.1c-.2-.1-.3-.4-.2-.5");
    			add_location(path81, file$c, 253, 1, 11550);
    			attr_dev(path82, "fill", "none");
    			attr_dev(path82, "stroke", "#000");
    			attr_dev(path82, "stroke-width", ".3");
    			attr_dev(path82, "d", "M124.8 212c.1-.2.4-.2.5 0 .2.1.3.3.2.5l-.5-.1c-.2-.1-.3-.4-.2-.5z");
    			add_location(path82, file$c, 254, 1, 11644);
    			attr_dev(path83, "fill", "#c8b100");
    			attr_dev(path83, "d", "m144.3 212.2.6-.7c.2-.2.7-.3.7-.3 0-.1-.3-.3-.6-.3a.6.6 0 0 0-.4.2v-.2s-.3 0-.4.3v.7l.1.3");
    			add_location(path83, file$c, 260, 1, 11777);
    			attr_dev(path84, "fill", "none");
    			attr_dev(path84, "stroke", "#000");
    			attr_dev(path84, "stroke-width", ".3");
    			attr_dev(path84, "d", "m144.3 212.2.6-.7c.2-.2.7-.3.7-.3 0-.1-.3-.3-.6-.3a.6.6 0 0 0-.4.2v-.2s-.3 0-.4.3v.7l.1.3z");
    			add_location(path84, file$c, 264, 1, 11901);
    			attr_dev(path85, "fill", "#c8b100");
    			attr_dev(path85, "d", "M144.3 212c0-.2-.3-.2-.5 0-.2.1-.2.3-.1.5l.5-.1c.2-.1.2-.4.1-.5");
    			add_location(path85, file$c, 270, 1, 12059);
    			attr_dev(path86, "fill", "none");
    			attr_dev(path86, "stroke", "#000");
    			attr_dev(path86, "stroke-width", ".3");
    			attr_dev(path86, "d", "M144.3 212c0-.2-.3-.2-.5 0-.2.1-.2.3-.1.5l.5-.1c.2-.1.2-.4.1-.5z");
    			add_location(path86, file$c, 271, 1, 12152);
    			attr_dev(path87, "fill", "#c8b100");
    			attr_dev(path87, "d", "M124 223h21.4v-5.5H124v5.6z");
    			add_location(path87, file$c, 277, 1, 12284);
    			attr_dev(path88, "fill", "none");
    			attr_dev(path88, "stroke", "#000");
    			attr_dev(path88, "stroke-width", ".4");
    			attr_dev(path88, "d", "M124 223h21.4v-5.5H124v5.6z");
    			add_location(path88, file$c, 278, 1, 12341);
    			attr_dev(path89, "fill", "#c8b100");
    			attr_dev(path89, "d", "M126.2 226.8a1 1 0 0 1 .4 0h16.5a1.4 1.4 0 0 1-1-1.2c0-.6.5-1.1 1-1.3a1.7 1.7 0 0 1-.4 0h-16a1.4 1.4 0 0 1-.5 0c.6.2 1 .7 1 1.3a1.3 1.3 0 0 1-1 1.2");
    			add_location(path89, file$c, 279, 1, 12427);
    			attr_dev(path90, "fill", "none");
    			attr_dev(path90, "stroke", "#000");
    			attr_dev(path90, "stroke-linejoin", "round");
    			attr_dev(path90, "stroke-width", ".4");
    			attr_dev(path90, "d", "M126.2 226.8a1 1 0 0 1 .4 0h16.5a1.4 1.4 0 0 1-1-1.2c0-.6.5-1.1 1-1.3a1.7 1.7 0 0 1-.4 0h-16a1.4 1.4 0 0 1-.5 0c.6.2 1 .7 1 1.3a1.3 1.3 0 0 1-1 1.2z");
    			add_location(path90, file$c, 283, 1, 12609);
    			attr_dev(path91, "fill", "#c8b100");
    			attr_dev(path91, "d", "M126.6 226.8h16c.6 0 1 .3 1 .7 0 .4-.4.8-1 .8h-16c-.5 0-1-.4-1-.8s.5-.8 1-.8");
    			add_location(path91, file$c, 290, 1, 12851);
    			attr_dev(path92, "fill", "none");
    			attr_dev(path92, "stroke", "#000");
    			attr_dev(path92, "stroke-width", ".4");
    			attr_dev(path92, "d", "M126.6 226.8h16c.6 0 1 .3 1 .7 0 .4-.4.8-1 .8h-16c-.5 0-1-.4-1-.8s.5-.8 1-.8z");
    			add_location(path92, file$c, 291, 1, 12957);
    			attr_dev(path93, "fill", "#c8b100");
    			attr_dev(path93, "d", "M126.6 223h16c.6 0 1 .4 1 .7 0 .4-.4.6-1 .6h-16c-.5 0-1-.2-1-.6 0-.3.5-.6 1-.6");
    			add_location(path93, file$c, 297, 1, 13102);
    			attr_dev(path94, "fill", "none");
    			attr_dev(path94, "stroke", "#000");
    			attr_dev(path94, "stroke-width", ".4");
    			attr_dev(path94, "d", "M126.6 223h16c.6 0 1 .4 1 .7 0 .4-.4.6-1 .6h-16c-.5 0-1-.2-1-.6 0-.3.5-.6 1-.6z");
    			add_location(path94, file$c, 298, 1, 13210);
    			attr_dev(path95, "fill", "#005bbf");
    			attr_dev(path95, "d", "M149.6 317.4c-1.4 0-2.8-.3-3.7-.8a8.4 8.4 0 0 0-3.8-.8c-1.4 0-2.7.3-3.7.8a8.3 8.3 0 0 1-3.8.8c-1.5 0-2.8-.3-3.7-.8a8.4 8.4 0 0 0-3.7-.8 8 8 0 0 0-3.7.8 8.3 8.3 0 0 1-3.8.8v2.4c1.5 0 2.8-.4 3.8-.9a8.2 8.2 0 0 1 3.7-.8c1.4 0 2.7.3 3.7.8s2.2.9 3.7.9a8.4 8.4 0 0 0 3.8-.9c1-.5 2.3-.8 3.7-.8 1.5 0 2.8.3 3.8.8s2.2.9 3.7.9v-2.4");
    			add_location(path95, file$c, 304, 1, 13357);
    			attr_dev(path96, "fill", "none");
    			attr_dev(path96, "stroke", "#000");
    			attr_dev(path96, "stroke-width", ".4");
    			attr_dev(path96, "d", "M149.6 317.4c-1.4 0-2.8-.3-3.7-.8a8.4 8.4 0 0 0-3.8-.8c-1.4 0-2.7.3-3.7.8a8.3 8.3 0 0 1-3.8.8c-1.5 0-2.8-.3-3.7-.8a8.4 8.4 0 0 0-3.7-.8 8 8 0 0 0-3.7.8 8.3 8.3 0 0 1-3.8.8v2.4c1.5 0 2.8-.4 3.8-.9a8.2 8.2 0 0 1 3.7-.8c1.4 0 2.7.3 3.7.8s2.2.9 3.7.9a8.4 8.4 0 0 0 3.8-.9c1-.5 2.3-.8 3.7-.8 1.5 0 2.8.3 3.8.8s2.2.9 3.7.9v-2.4z");
    			add_location(path96, file$c, 308, 1, 13713);
    			attr_dev(path97, "fill", "#ccc");
    			attr_dev(path97, "d", "M149.6 319.8a8 8 0 0 1-3.7-.9 8.3 8.3 0 0 0-3.8-.8c-1.4 0-2.7.3-3.7.8s-2.3.9-3.8.9-2.8-.4-3.7-.9a8.4 8.4 0 0 0-3.7-.8 8.2 8.2 0 0 0-3.7.8c-1 .5-2.3.9-3.8.9v2.3c1.5 0 2.8-.4 3.8-.9a8.1 8.1 0 0 1 3.7-.7c1.4 0 2.7.2 3.7.7a8.3 8.3 0 0 0 7.5 0 8.5 8.5 0 0 1 7.5.1 8.1 8.1 0 0 0 3.7.8v-2.3");
    			add_location(path97, file$c, 314, 1, 14103);
    			attr_dev(path98, "fill", "none");
    			attr_dev(path98, "stroke", "#000");
    			attr_dev(path98, "stroke-width", ".4");
    			attr_dev(path98, "d", "M149.6 319.8a8 8 0 0 1-3.7-.9 8.3 8.3 0 0 0-3.8-.8c-1.4 0-2.7.3-3.7.8s-2.3.9-3.8.9-2.8-.4-3.7-.9a8.4 8.4 0 0 0-3.7-.8 8.2 8.2 0 0 0-3.7.8c-1 .5-2.3.9-3.8.9v2.3c1.5 0 2.8-.4 3.8-.9a8.1 8.1 0 0 1 3.7-.7c1.4 0 2.7.2 3.7.7a8.3 8.3 0 0 0 7.5 0 8.5 8.5 0 0 1 7.5.1 8.1 8.1 0 0 0 3.7.8v-2.3");
    			add_location(path98, file$c, 318, 1, 14418);
    			attr_dev(path99, "fill", "#005bbf");
    			attr_dev(path99, "d", "M149.6 322a7 7 0 0 1-3.7-.8 8.3 8.3 0 0 0-3.8-.7c-1.4 0-2.7.2-3.7.7-1 .6-2.3.9-3.8.9s-2.8-.4-3.7-.9a8.4 8.4 0 0 0-3.7-.8 8 8 0 0 0-3.7.8c-1 .5-2.3.9-3.8.9v2.3c1.5 0 2.8-.3 3.8-.9a10.2 10.2 0 0 1 7.4 0 7 7 0 0 0 3.7.9 8.4 8.4 0 0 0 3.8-.8c1-.5 2.3-.8 3.7-.8 1.5 0 2.8.3 3.8.8s2.2.8 3.7.8V322");
    			add_location(path99, file$c, 324, 1, 14769);
    			attr_dev(path100, "fill", "none");
    			attr_dev(path100, "stroke", "#000");
    			attr_dev(path100, "stroke-width", ".4");
    			attr_dev(path100, "d", "M149.6 322a7 7 0 0 1-3.7-.8 8.3 8.3 0 0 0-3.8-.7c-1.4 0-2.7.2-3.7.7-1 .6-2.3.9-3.8.9s-2.8-.4-3.7-.9a8.4 8.4 0 0 0-3.7-.8 8 8 0 0 0-3.7.8c-1 .5-2.3.9-3.8.9v2.3c1.5 0 2.8-.3 3.8-.9a10.2 10.2 0 0 1 7.4 0 7 7 0 0 0 3.7.9 8.4 8.4 0 0 0 3.8-.8c1-.5 2.3-.8 3.7-.8 1.5 0 2.8.3 3.8.8s2.2.8 3.7.8V322");
    			add_location(path100, file$c, 328, 1, 15094);
    			attr_dev(path101, "fill", "#ccc");
    			attr_dev(path101, "d", "M149.6 326.7a8 8 0 0 1-3.7-.8c-1-.5-2.3-.8-3.7-.8a8.4 8.4 0 0 0-3.8.8c-1 .5-2.3.8-3.8.8a7 7 0 0 1-3.7-.9 8.4 8.4 0 0 0-3.7-.7c-1.4 0-2.7.3-3.7.8s-2.3.8-3.8.8v-2.3a8.3 8.3 0 0 0 3.8-.9 10.2 10.2 0 0 1 7.4 0 8 8 0 0 0 3.7.9 8.4 8.4 0 0 0 3.8-.8c1-.5 2.3-.8 3.8-.8 1.4 0 2.7.3 3.7.8s2.3.8 3.7.8v2.3");
    			add_location(path101, file$c, 334, 1, 15452);
    			attr_dev(path102, "fill", "none");
    			attr_dev(path102, "stroke", "#000");
    			attr_dev(path102, "stroke-width", ".4");
    			attr_dev(path102, "d", "M149.6 326.7a8 8 0 0 1-3.7-.8c-1-.5-2.3-.8-3.7-.8a8.4 8.4 0 0 0-3.8.8c-1 .5-2.3.8-3.8.8a7 7 0 0 1-3.7-.9 8.4 8.4 0 0 0-3.7-.7c-1.4 0-2.7.3-3.7.8s-2.3.8-3.8.8v-2.3a8.3 8.3 0 0 0 3.8-.9 10.2 10.2 0 0 1 7.4 0 8 8 0 0 0 3.7.9 8.4 8.4 0 0 0 3.8-.8c1-.5 2.3-.8 3.8-.8 1.4 0 2.7.3 3.7.8s2.3.8 3.7.8v2.3");
    			add_location(path102, file$c, 338, 1, 15779);
    			attr_dev(path103, "fill", "#005bbf");
    			attr_dev(path103, "d", "M149.6 329a8.1 8.1 0 0 1-3.7-.8c-1-.5-2.3-.8-3.7-.8a8.4 8.4 0 0 0-3.8.8c-1 .5-2.3.8-3.8.8a7 7 0 0 1-3.7-.9 8.4 8.4 0 0 0-3.7-.7c-1.4 0-2.7.3-3.7.8s-2.3.8-3.8.8v-2.3a8.3 8.3 0 0 0 3.8-.8c1-.5 2.3-.8 3.7-.8 1.4 0 2.7.3 3.7.7a8.4 8.4 0 0 0 7.5 0c1-.4 2.3-.7 3.8-.7 1.4 0 2.7.3 3.7.8s2.2.8 3.7.8v2.3");
    			add_location(path103, file$c, 344, 1, 16142);
    			attr_dev(path104, "fill", "none");
    			attr_dev(path104, "stroke", "#000");
    			attr_dev(path104, "stroke-width", ".4");
    			attr_dev(path104, "d", "M149.6 329a8.1 8.1 0 0 1-3.7-.8c-1-.5-2.3-.8-3.7-.8a8.4 8.4 0 0 0-3.8.8c-1 .5-2.3.8-3.8.8a7 7 0 0 1-3.7-.9 8.4 8.4 0 0 0-3.7-.7c-1.4 0-2.7.3-3.7.8s-2.3.8-3.8.8v-2.3a8.3 8.3 0 0 0 3.8-.8c1-.5 2.3-.8 3.7-.8 1.4 0 2.7.3 3.7.7a8.4 8.4 0 0 0 7.5 0c1-.4 2.3-.7 3.8-.7 1.4 0 2.7.3 3.7.8s2.2.8 3.7.8v2.3z");
    			add_location(path104, file$c, 348, 1, 16472);
    			attr_dev(path105, "fill", "#c8b100");
    			attr_dev(path105, "d", "m126.2 308 .2.5c0 1.5-1.3 2.6-2.7 2.6h22a2.7 2.7 0 0 1-2.7-2.6v-.5a1.3 1.3 0 0 1-.3 0h-16a1.4 1.4 0 0 1-.5 0");
    			add_location(path105, file$c, 354, 1, 16836);
    			attr_dev(path106, "fill", "none");
    			attr_dev(path106, "stroke", "#000");
    			attr_dev(path106, "stroke-linejoin", "round");
    			attr_dev(path106, "stroke-width", ".4");
    			attr_dev(path106, "d", "m126.2 308 .2.5c0 1.5-1.3 2.6-2.7 2.6h22a2.7 2.7 0 0 1-2.7-2.6v-.5a1.3 1.3 0 0 1-.3 0h-16a1.4 1.4 0 0 1-.5 0z");
    			add_location(path106, file$c, 358, 1, 16979);
    			attr_dev(path107, "fill", "#c8b100");
    			attr_dev(path107, "d", "M126.6 306.5h16c.6 0 1 .3 1 .8 0 .4-.4.7-1 .7h-16c-.5 0-1-.3-1-.8 0-.4.5-.7 1-.7");
    			add_location(path107, file$c, 365, 1, 17182);
    			attr_dev(path108, "fill", "none");
    			attr_dev(path108, "stroke", "#000");
    			attr_dev(path108, "stroke-width", ".4");
    			attr_dev(path108, "d", "M126.6 306.5h16c.6 0 1 .3 1 .8 0 .4-.4.7-1 .7h-16c-.5 0-1-.3-1-.8 0-.4.5-.7 1-.7z");
    			add_location(path108, file$c, 366, 1, 17292);
    			attr_dev(path109, "fill", "#c8b100");
    			attr_dev(path109, "d", "M123.7 316.7h22V311h-22v5.6z");
    			add_location(path109, file$c, 372, 1, 17441);
    			attr_dev(path110, "fill", "none");
    			attr_dev(path110, "stroke", "#000");
    			attr_dev(path110, "stroke-width", ".4");
    			attr_dev(path110, "d", "M123.7 316.7h22V311h-22v5.6z");
    			add_location(path110, file$c, 373, 1, 17499);
    			attr_dev(path111, "fill", "#ad1519");
    			attr_dev(path111, "d", "M122 286.7c-2.2 1.2-3.7 2.5-3.4 3.2 0 .6.8 1 1.8 1.6 1.5 1.1 2.5 3 1.7 4a5.5 5.5 0 0 0-.1-8.8");
    			add_location(path111, file$c, 374, 1, 17586);
    			attr_dev(path112, "fill", "none");
    			attr_dev(path112, "stroke", "#000");
    			attr_dev(path112, "stroke-width", ".4");
    			attr_dev(path112, "d", "M122 286.7c-2.2 1.2-3.7 2.5-3.4 3.2 0 .6.8 1 1.8 1.6 1.5 1.1 2.5 3 1.7 4a5.5 5.5 0 0 0-.1-8.8z");
    			add_location(path112, file$c, 378, 1, 17714);
    			attr_dev(path113, "fill", "#ccc");
    			attr_dev(path113, "d", "M126.8 305.6h15.6V229h-15.6v76.5z");
    			add_location(path113, file$c, 384, 1, 17876);
    			attr_dev(path114, "fill", "none");
    			attr_dev(path114, "stroke", "#000");
    			attr_dev(path114, "stroke-width", ".4");
    			attr_dev(path114, "d", "M138 229.2v76.3m1.7-76.3v76.3m-12.9 0h15.6v-76.4h-15.6v76.5z");
    			add_location(path114, file$c, 385, 1, 17936);
    			attr_dev(path115, "fill", "#ad1519");
    			attr_dev(path115, "d", "M158.4 257.7a49.6 49.6 0 0 0-23.3-2c-9.4 1.6-16.5 5.3-15.9 8.4v.2l-3.5-8.2c-.6-3.3 7.2-7.5 17.6-9.2a43 43 0 0 1 9.2-.7c6.6 0 12.4.8 15.8 2.1v9.4");
    			add_location(path115, file$c, 391, 1, 18064);
    			attr_dev(path116, "fill", "none");
    			attr_dev(path116, "stroke", "#000");
    			attr_dev(path116, "stroke-linejoin", "round");
    			attr_dev(path116, "stroke-width", ".4");
    			attr_dev(path116, "d", "M158.4 257.7a49.6 49.6 0 0 0-23.3-2c-9.4 1.6-16.5 5.3-15.9 8.4v.2l-3.5-8.2c-.6-3.3 7.2-7.5 17.6-9.2a43 43 0 0 1 9.2-.7c6.6 0 12.4.8 15.8 2.1v9.4");
    			add_location(path116, file$c, 395, 1, 18243);
    			attr_dev(path117, "fill", "#ad1519");
    			attr_dev(path117, "d", "M126.8 267.3c-4.3-.3-7.3-1.4-7.6-3.2-.3-1.5 1.2-3 3.8-4.5 1.2.1 2.5.3 3.8.3v7.4");
    			add_location(path117, file$c, 402, 1, 18481);
    			attr_dev(path118, "fill", "none");
    			attr_dev(path118, "stroke", "#000");
    			attr_dev(path118, "stroke-width", ".4");
    			attr_dev(path118, "d", "M126.8 267.3c-4.3-.3-7.3-1.4-7.6-3.2-.3-1.5 1.2-3 3.8-4.5 1.2.1 2.5.3 3.8.3v7.4");
    			add_location(path118, file$c, 403, 1, 18590);
    			attr_dev(path119, "fill", "#ad1519");
    			attr_dev(path119, "d", "M142.5 261.5c2.7.4 4.7 1 5.7 1.9l.1.2c.5 1-1.9 3-5.9 5.4v-7.5");
    			add_location(path119, file$c, 409, 1, 18737);
    			attr_dev(path120, "fill", "none");
    			attr_dev(path120, "stroke", "#000");
    			attr_dev(path120, "stroke-width", ".4");
    			attr_dev(path120, "d", "M142.5 261.5c2.7.4 4.7 1 5.7 1.9l.1.2c.5 1-1.9 3-5.9 5.4v-7.5");
    			add_location(path120, file$c, 410, 1, 18828);
    			attr_dev(path121, "fill", "#ad1519");
    			attr_dev(path121, "d", "M117.1 282c-.4-1.2 3.8-3.6 9.8-5.8l7.8-3.2c8.3-3.7 14.4-7.9 13.6-9.4v-.2c.4.4 1 8 1 8 .8 1.3-4.8 5.5-12.4 9.1-2.5 1.2-7.6 3-10 4-4.4 1.4-8.7 4.3-8.3 5.3l-1.5-7.7");
    			add_location(path121, file$c, 416, 1, 18957);
    			attr_dev(path122, "fill", "none");
    			attr_dev(path122, "stroke", "#000");
    			attr_dev(path122, "stroke-linejoin", "round");
    			attr_dev(path122, "stroke-width", ".4");
    			attr_dev(path122, "d", "M117.1 282c-.4-1.2 3.8-3.6 9.8-5.8l7.8-3.2c8.3-3.7 14.4-7.9 13.6-9.4v-.2c.4.4 1 8 1 8 .8 1.3-4.8 5.5-12.4 9.1-2.5 1.2-7.6 3-10 4-4.4 1.4-8.7 4.3-8.3 5.3l-1.5-7.7z");
    			add_location(path122, file$c, 420, 1, 19153);
    			attr_dev(path123, "fill", "#c8b100");
    			attr_dev(path123, "d", "M125.8 254c1.9-.6 3.1-1.5 2.5-3-.4-1-1.4-1-2.8-.6l-2.6 1 2.3 5.8.8-.3.8-.3-1-2.5zm-1.2-2.7.7-.3c.5-.2 1.2.1 1.4.8.2.5.2 1-.5 1.5a4.4 4.4 0 0 1-.6.3l-1-2.3m7.3-2.5-.9.3h-.8l1.3 6.1 4.3-.8-.2-.4v-.4l-2.5.6-1.2-5.3m8.4 5.2c.8-2.2 1.7-4.3 2.7-6.4a5.3 5.3 0 0 1-1 0 54.8 54.8 0 0 1-1.8 4.6l-2.4-4.3-1 .1h-1a131.4 131.4 0 0 1 3.5 6h1m8.8-4.7.4-.9a3.4 3.4 0 0 0-1.7-.6c-1.7-.1-2.7.6-2.8 1.7-.2 2.1 3.2 2 3 3.4 0 .6-.7.9-1.4.8-.8 0-1.4-.5-1.4-1.2h-.3a7.3 7.3 0 0 1-.4 1.1 4 4 0 0 0 1.8.6c1.7.2 3-.5 3.2-1.7.2-2-3.3-2.1-3.1-3.4 0-.5.4-.8 1.3-.7.7 0 1 .4 1.2.9h.2");
    			add_location(path123, file$c, 427, 1, 19409);
    			attr_dev(path124, "fill", "#ad1519");
    			attr_dev(path124, "d", "M277.9 211.6s-.7.8-1.3.9c-.5 0-1.1-.5-1.1-.5s-.5.5-1 .6c-.6.1-1.4-.6-1.4-.6l-1 1c-.6 0-1.1-.3-1.1-.3s-.3.4-.7.6h-.4l-.6-.4-.7-.7-.5-.3-.4-1v-.5c-.1-.6.8-1.4 2.2-1.7a3.9 3.9 0 0 1 2 0c.5-.5 1.7-.8 3-.8s2.4.3 3 .7a5.5 5.5 0 0 1 2.9-.7c1.3 0 2.5.3 3 .8.5-.2 1.2-.2 2 0 1.4.3 2.3 1 2.2 1.7v.5l-.4 1-.6.3-.6.7-.6.3s-.3.2-.4 0c-.4-.1-.7-.5-.7-.5s-.6.4-1 .2c-.5-.2-1-1-1-1s-.9.8-1.4.7c-.6-.1-1-.6-1-.6s-.7.6-1.2.5c-.5-.1-1.2-.9-1.2-.9");
    			add_location(path124, file$c, 431, 1, 19997);
    			attr_dev(path125, "fill", "none");
    			attr_dev(path125, "stroke", "#000");
    			attr_dev(path125, "stroke-width", ".3");
    			attr_dev(path125, "d", "M277.9 211.6s-.7.8-1.3.9c-.5 0-1.1-.5-1.1-.5s-.5.5-1 .6c-.6.1-1.4-.6-1.4-.6l-1 1c-.6 0-1.1-.3-1.1-.3s-.3.4-.7.6h-.4l-.6-.4-.7-.7-.5-.3-.4-1v-.5c-.1-.6.8-1.4 2.2-1.7a3.9 3.9 0 0 1 2 0c.5-.5 1.7-.8 3-.8s2.4.3 3 .7a5.5 5.5 0 0 1 2.9-.7c1.3 0 2.5.3 3 .8.5-.2 1.2-.2 2 0 1.4.3 2.3 1 2.2 1.7v.5l-.4 1-.6.3-.6.7-.6.3s-.3.2-.4 0c-.4-.1-.7-.5-.7-.5s-.6.4-1 .2c-.5-.2-1-1-1-1s-.9.8-1.4.7c-.6-.1-1-.6-1-.6s-.7.6-1.2.5c-.5-.1-1.2-.9-1.2-.9z");
    			add_location(path125, file$c, 435, 1, 20459);
    			attr_dev(path126, "fill", "#c8b100");
    			attr_dev(path126, "d", "M276.5 207.6c0-1 .6-2 1.3-2 .8 0 1.3 1 1.3 2s-.5 1.8-1.3 1.8c-.7 0-1.3-.8-1.3-1.9");
    			add_location(path126, file$c, 441, 1, 20955);
    			attr_dev(path127, "fill", "none");
    			attr_dev(path127, "stroke", "#000");
    			attr_dev(path127, "stroke-width", ".3");
    			attr_dev(path127, "d", "M276.5 207.6c0-1 .6-2 1.3-2 .8 0 1.3 1 1.3 2s-.5 1.8-1.3 1.8c-.7 0-1.3-.8-1.3-1.9z");
    			add_location(path127, file$c, 445, 1, 21071);
    			attr_dev(path128, "fill", "#c8b100");
    			attr_dev(path128, "d", "M277.3 207.6c0-1 .2-1.8.5-1.8.4 0 .7.8.7 1.8s-.3 1.7-.6 1.7c-.4 0-.6-.8-.6-1.8");
    			add_location(path128, file$c, 451, 1, 21221);
    			attr_dev(path129, "fill", "none");
    			attr_dev(path129, "stroke", "#000");
    			attr_dev(path129, "stroke-width", ".3");
    			attr_dev(path129, "d", "M277.3 207.6c0-1 .2-1.8.5-1.8.4 0 .7.8.7 1.8s-.3 1.7-.6 1.7c-.4 0-.6-.8-.6-1.8z");
    			add_location(path129, file$c, 452, 1, 21329);
    			attr_dev(path130, "fill", "#c8b100");
    			attr_dev(path130, "d", "M271 215.3a4.5 4.5 0 0 0-.5-1 27.4 27.4 0 0 1 14.8 0l-.6.8a5.2 5.2 0 0 0-.3.8 22.9 22.9 0 0 0-6.6-.8c-2.6 0-5.2.3-6.6.8l-.2-.6");
    			add_location(path130, file$c, 458, 1, 21476);
    			attr_dev(path131, "fill", "none");
    			attr_dev(path131, "stroke", "#000");
    			attr_dev(path131, "stroke-width", ".3");
    			attr_dev(path131, "d", "M271 215.3a4.5 4.5 0 0 0-.5-1 27.4 27.4 0 0 1 14.8 0l-.6.8a5.2 5.2 0 0 0-.3.8 22.9 22.9 0 0 0-6.6-.8c-2.6 0-5.2.3-6.6.8l-.2-.6");
    			add_location(path131, file$c, 462, 1, 21637);
    			attr_dev(path132, "fill", "#c8b100");
    			attr_dev(path132, "d", "M277.8 217.7c2.4 0 5-.4 5.9-.6.6-.2 1-.5 1-.8 0-.2-.2-.3-.4-.4a24.1 24.1 0 0 0-6.5-.8c-2.5 0-5 .3-6.4.8-.2 0-.3.2-.4.3 0 .4.3.7 1 .9 1 .2 3.5.6 5.8.6");
    			add_location(path132, file$c, 468, 1, 21831);
    			attr_dev(path133, "fill", "none");
    			attr_dev(path133, "stroke", "#000");
    			attr_dev(path133, "stroke-width", ".3");
    			attr_dev(path133, "d", "M277.8 217.7c2.4 0 5-.4 5.9-.6.6-.2 1-.5 1-.8 0-.2-.2-.3-.4-.4a24.1 24.1 0 0 0-6.5-.8c-2.5 0-5 .3-6.4.8-.2 0-.3.2-.4.3 0 .4.3.7 1 .9 1 .2 3.5.6 5.8.6z");
    			add_location(path133, file$c, 472, 1, 22015);
    			attr_dev(path134, "fill", "#fff");
    			attr_dev(path134, "d", "M283.5 208.4c0-.2.2-.4.4-.4s.5.2.5.4-.2.4-.5.4a.4.4 0 0 1-.4-.4");
    			add_location(path134, file$c, 478, 1, 22233);
    			attr_dev(path135, "fill", "none");
    			attr_dev(path135, "stroke", "#000");
    			attr_dev(path135, "stroke-width", ".2");
    			attr_dev(path135, "d", "M283.5 208.4c0-.2.2-.4.4-.4s.5.2.5.4-.2.4-.5.4a.4.4 0 0 1-.4-.4zm-.2-1.4a.4.4 0 0 1 .4-.4c.2 0 .4.1.4.4s-.2.4-.4.4a.4.4 0 0 1-.4-.4zm-1.1-1c0-.2.2-.3.4-.3s.4.1.4.4c0 .2-.2.4-.4.4a.4.4 0 0 1-.4-.5zm-1.4-.4c0-.2.2-.4.4-.4.3 0 .5.2.5.4s-.2.4-.4.4-.5-.2-.5-.4zm-1.4 0c0-.2.2-.3.5-.3s.4.1.4.4c0 .2-.2.4-.4.4a.4.4 0 0 1-.5-.4z");
    			add_location(path135, file$c, 479, 1, 22323);
    			attr_dev(path136, "fill", "none");
    			attr_dev(path136, "stroke", "#000");
    			attr_dev(path136, "stroke-linecap", "round");
    			attr_dev(path136, "stroke-width", ".3");
    			attr_dev(path136, "d", "m287.8 211.2.2-1a2.7 2.7 0 0 0-2.7-2.8c-.5 0-1 .1-1.3.3");
    			add_location(path136, file$c, 485, 1, 22711);
    			attr_dev(path137, "fill", "none");
    			attr_dev(path137, "stroke", "#000");
    			attr_dev(path137, "stroke-width", ".3");
    			attr_dev(path137, "d", "m283 209.2.2-.8c0-1.1-1.1-2-2.5-2-.6 0-1.2.2-1.6.4");
    			add_location(path137, file$c, 492, 1, 22859);
    			attr_dev(path138, "fill", "none");
    			attr_dev(path138, "stroke", "#000");
    			attr_dev(path138, "stroke-width", ".2");
    			attr_dev(path138, "d", "M288.2 210c0-.3.2-.5.4-.5s.4.2.4.4c0 .3-.2.4-.4.4s-.4-.1-.4-.4zm-.2-1.6c0-.2.2-.4.4-.4a.4.4 0 0 1 .5.4c0 .2-.2.4-.4.4-.3 0-.5-.2-.5-.4zm-1-1.1a.4.4 0 0 1 .5-.4c.2 0 .4.1.4.4a.4.4 0 0 1-.4.4.4.4 0 0 1-.5-.4zm-1.3-.7c0-.2.2-.4.5-.4s.4.2.4.4c0 .3-.2.5-.4.5a.4.4 0 0 1-.5-.5zm-1.4.1c0-.2.2-.4.5-.4s.4.2.4.4-.2.4-.4.4-.5-.2-.5-.4z");
    			add_location(path138, file$c, 493, 1, 22968);
    			attr_dev(path139, "fill", "#c8b100");
    			attr_dev(path139, "d", "m285.3 213.2-.5-.5s-.6.3-1.3.2c-.6 0-.9-1-.9-1s-.7.7-1.3.7c-.7 0-1-.6-1-.6s-.7.5-1.3.4c-.6 0-1.2-.8-1.2-.8s-.6.8-1.2.8c-.6.1-1-.5-1-.5s-.3.6-1.1.7-1.4-.6-1.4-.6-.4.7-1 1c-.5 0-1.2-.4-1.2-.4l-.1.5-.3.1.1.5a27 27 0 0 1 7.3-.9c2.8 0 5.4.4 7.3 1l.2-.6");
    			add_location(path139, file$c, 499, 1, 23361);
    			attr_dev(path140, "fill", "none");
    			attr_dev(path140, "stroke", "#000");
    			attr_dev(path140, "stroke-width", ".3");
    			attr_dev(path140, "d", "m285.3 213.2-.5-.5s-.6.3-1.3.2c-.6 0-.9-1-.9-1s-.7.7-1.3.7c-.7 0-1-.6-1-.6s-.7.5-1.3.4c-.6 0-1.2-.8-1.2-.8s-.6.8-1.2.8c-.6.1-1-.5-1-.5s-.3.6-1.1.7-1.4-.6-1.4-.6-.4.7-1 1c-.5 0-1.2-.4-1.2-.4l-.1.5-.3.1.1.5a27 27 0 0 1 7.3-.9c2.8 0 5.4.4 7.3 1l.2-.6z");
    			add_location(path140, file$c, 503, 1, 23643);
    			attr_dev(path141, "fill", "#fff");
    			attr_dev(path141, "d", "M271.3 208.4c0-.2.2-.4.4-.4s.4.2.4.4a.4.4 0 0 1-.4.4.4.4 0 0 1-.4-.4");
    			add_location(path141, file$c, 509, 1, 23959);
    			attr_dev(path142, "fill", "none");
    			attr_dev(path142, "stroke", "#000");
    			attr_dev(path142, "stroke-width", ".2");
    			attr_dev(path142, "d", "M271.3 208.4c0-.2.2-.4.4-.4s.4.2.4.4a.4.4 0 0 1-.4.4.4.4 0 0 1-.4-.4zm.2-1.4c0-.3.2-.4.4-.4s.5.1.5.4-.2.4-.5.4a.4.4 0 0 1-.4-.4zm1-1c0-.2.3-.3.5-.3s.5.1.5.4c0 .2-.2.4-.5.4a.4.4 0 0 1-.4-.5zm1.4-.4c0-.2.2-.4.5-.4s.4.2.4.4-.2.4-.4.4-.5-.2-.5-.4zm1.4 0c0-.2.2-.3.5-.3.2 0 .4.1.4.4 0 .2-.2.4-.4.4a.4.4 0 0 1-.5-.4z");
    			add_location(path142, file$c, 510, 1, 24054);
    			attr_dev(path143, "fill", "none");
    			attr_dev(path143, "stroke", "#000");
    			attr_dev(path143, "stroke-linecap", "round");
    			attr_dev(path143, "stroke-width", ".3");
    			attr_dev(path143, "d", "M267.8 211.2a2.8 2.8 0 0 1-.2-1 2.7 2.7 0 0 1 2.7-2.8c.5 0 1 .1 1.4.3");
    			add_location(path143, file$c, 516, 1, 24432);
    			attr_dev(path144, "fill", "none");
    			attr_dev(path144, "stroke", "#000");
    			attr_dev(path144, "stroke-width", ".3");
    			attr_dev(path144, "d", "M272.7 209.2a1.7 1.7 0 0 1-.3-.8c0-1 1.2-2 2.6-2a3 3 0 0 1 1.5.4");
    			add_location(path144, file$c, 523, 1, 24594);
    			attr_dev(path145, "fill", "none");
    			attr_dev(path145, "stroke", "#000");
    			attr_dev(path145, "stroke-width", ".2");
    			attr_dev(path145, "d", "M266.6 210c0-.3.2-.5.4-.5.3 0 .4.2.4.4a.4.4 0 0 1-.4.4c-.2 0-.4-.1-.4-.4zm.1-1.6c0-.2.3-.4.5-.4s.4.2.4.4-.2.4-.4.4-.4-.2-.4-.4zm1-1.1c0-.3.2-.4.5-.4a.4.4 0 0 1 .4.4.4.4 0 0 1-.4.4.4.4 0 0 1-.5-.4zm1.3-.7c0-.2.2-.4.5-.4.2 0 .4.2.4.4 0 .3-.2.5-.4.5a.4.4 0 0 1-.5-.5zm1.4.1c0-.2.2-.4.5-.4a.4.4 0 0 1 .4.4.4.4 0 0 1-.4.4c-.3 0-.5-.2-.5-.4z");
    			add_location(path145, file$c, 529, 1, 24726);
    			attr_dev(path146, "fill", "#c8b100");
    			attr_dev(path146, "d", "M277.9 210.7h.2a1 1 0 0 0 0 .4c0 .6.5 1 1 1a1 1 0 0 0 1-.7l.2-.3v.4c.1.5.6.8 1.1.8.6 0 1-.4 1-1a.7.7 0 0 0 0-.1l.4-.4.2.5a1 1 0 0 0-.1.4 1 1 0 0 0 1 1c.4 0 .7-.2.9-.5l.2-.2v.3c0 .3.1.6.4.7 0 0 .4 0 1-.4s.7-.7.7-.7v.4s-.5.8-1 1c-.2.2-.5.4-.8.3-.3 0-.6-.3-.7-.6a1.5 1.5 0 0 1-.7.2c-.6 0-1.2-.3-1.4-.8a1.5 1.5 0 0 1-1.1.5c-.5 0-1-.2-1.2-.6a1.5 1.5 0 0 1-1 .4c-.6 0-1-.2-1.4-.6-.2.4-.7.6-1.2.6-.4 0-.8-.1-1-.4a1.6 1.6 0 0 1-1.3.6c-.4 0-.8-.2-1.1-.5-.2.5-.8.8-1.4.8-.2 0-.5 0-.7-.2-.1.3-.4.6-.7.6-.3 0-.6 0-.9-.2a4.2 4.2 0 0 1-1-1l.1-.5.8.7c.5.4.9.4.9.4.3 0 .4-.4.4-.7v-.3l.2.2c.2.3.5.5.9.5a1 1 0 0 0 1-1 1 1 0 0 0 0-.4v-.5l.4.4v.1c0 .6.5 1 1 1 .6 0 1-.3 1.1-.9v-.3l.2.3c.2.4.6.7 1 .7.6 0 1.1-.4 1.1-1a1 1 0 0 0 0-.3h.2");
    			add_location(path146, file$c, 535, 1, 25129);
    			attr_dev(path147, "fill", "none");
    			attr_dev(path147, "stroke", "#000");
    			attr_dev(path147, "stroke-width", ".3");
    			attr_dev(path147, "d", "M277.9 210.7h.2a1 1 0 0 0 0 .4c0 .6.5 1 1 1a1 1 0 0 0 1-.7l.2-.3v.4c.1.5.6.8 1.1.8.6 0 1-.4 1-1a.7.7 0 0 0 0-.1l.4-.4.2.5a1 1 0 0 0-.1.4 1 1 0 0 0 1 1c.4 0 .7-.2.9-.5l.2-.2v.3c0 .3.1.6.4.7 0 0 .4 0 1-.4s.7-.7.7-.7v.4s-.5.8-1 1c-.2.2-.5.4-.8.3-.3 0-.6-.3-.7-.6a1.5 1.5 0 0 1-.7.2c-.6 0-1.2-.3-1.4-.8a1.5 1.5 0 0 1-1.1.5c-.5 0-1-.2-1.2-.6a1.5 1.5 0 0 1-1 .4c-.6 0-1-.2-1.4-.6-.2.4-.7.6-1.2.6-.4 0-.8-.1-1-.4a1.6 1.6 0 0 1-1.3.6c-.4 0-.8-.2-1.1-.5-.2.5-.8.8-1.4.8-.2 0-.5 0-.7-.2-.1.3-.4.6-.7.6-.3 0-.6 0-.9-.2a4.2 4.2 0 0 1-1-1l.1-.5.8.7c.5.4.9.4.9.4.3 0 .4-.4.4-.7v-.3l.2.2c.2.3.5.5.9.5a1 1 0 0 0 1-1 1 1 0 0 0 0-.4v-.5l.4.4v.1c0 .6.5 1 1 1 .6 0 1-.3 1.1-.9v-.3l.2.3c.2.4.6.7 1 .7.6 0 1.1-.4 1.1-1a1 1 0 0 0 0-.3h.2z");
    			add_location(path147, file$c, 539, 1, 25878);
    			attr_dev(path148, "fill", "#c8b100");
    			attr_dev(path148, "d", "M277.8 213.3c-2.9 0-5.5.4-7.3 1l-.3-.2.1-.3c2-.6 4.6-1 7.5-1 3 0 5.7.4 7.6 1 0 0 .2.2.1.3l-.3.2a27 27 0 0 0-7.4-1");
    			add_location(path148, file$c, 545, 1, 26661);
    			attr_dev(path149, "fill", "none");
    			attr_dev(path149, "stroke", "#000");
    			attr_dev(path149, "stroke-width", ".3");
    			attr_dev(path149, "d", "M277.8 213.3c-2.9 0-5.5.4-7.3 1l-.3-.2.1-.3c2-.6 4.6-1 7.5-1 3 0 5.7.4 7.6 1 0 0 .2.2.1.3l-.3.2a27 27 0 0 0-7.4-1z");
    			add_location(path149, file$c, 549, 1, 26809);
    			attr_dev(path150, "fill", "#fff");
    			attr_dev(path150, "d", "M275 214.4c0-.3.2-.4.5-.4a.4.4 0 0 1 .4.4.4.4 0 0 1-.4.4c-.3 0-.5-.2-.5-.4");
    			add_location(path150, file$c, 555, 1, 26991);
    			attr_dev(path151, "fill", "none");
    			attr_dev(path151, "stroke", "#000");
    			attr_dev(path151, "stroke-width", ".3");
    			attr_dev(path151, "d", "M275 214.4c0-.3.2-.4.5-.4a.4.4 0 0 1 .4.4.4.4 0 0 1-.4.4c-.3 0-.5-.2-.5-.4z");
    			add_location(path151, file$c, 556, 1, 27092);
    			attr_dev(path152, "fill", "#ad1519");
    			attr_dev(path152, "d", "M277.9 214.5h-1c-.1 0-.3 0-.3-.3l.3-.3h2a.3.3 0 0 1 .2.3.3.3 0 0 1-.3.3h-1");
    			add_location(path152, file$c, 562, 1, 27235);
    			attr_dev(path153, "fill", "none");
    			attr_dev(path153, "stroke", "#000");
    			attr_dev(path153, "stroke-width", ".3");
    			attr_dev(path153, "d", "M277.9 214.5h-1c-.1 0-.3 0-.3-.3l.3-.3h2a.3.3 0 0 1 .2.3.3.3 0 0 1-.3.3h-1");
    			add_location(path153, file$c, 563, 1, 27339);
    			attr_dev(path154, "fill", "#058e6e");
    			attr_dev(path154, "d", "M273.2 214.9h-.6a.3.3 0 0 1-.4-.2.3.3 0 0 1 .3-.3l.6-.1.7-.1c.2 0 .3 0 .4.2a.3.3 0 0 1-.3.4h-.7");
    			add_location(path154, file$c, 569, 1, 27481);
    			attr_dev(path155, "fill", "none");
    			attr_dev(path155, "stroke", "#000");
    			attr_dev(path155, "stroke-width", ".3");
    			attr_dev(path155, "d", "M273.2 214.9h-.6a.3.3 0 0 1-.4-.2.3.3 0 0 1 .3-.3l.6-.1.7-.1c.2 0 .3 0 .4.2a.3.3 0 0 1-.3.4h-.7");
    			add_location(path155, file$c, 573, 1, 27611);
    			attr_dev(path156, "fill", "#ad1519");
    			attr_dev(path156, "d", "m270.5 215.3.3-.4h.7l-.4.6-.6-.2");
    			add_location(path156, file$c, 579, 1, 27774);
    			attr_dev(path157, "fill", "none");
    			attr_dev(path157, "stroke", "#000");
    			attr_dev(path157, "stroke-width", ".3");
    			attr_dev(path157, "d", "m270.5 215.3.3-.4h.7l-.4.6-.6-.2");
    			add_location(path157, file$c, 580, 1, 27836);
    			attr_dev(path158, "fill", "#fff");
    			attr_dev(path158, "d", "M279.8 214.4c0-.3.2-.4.4-.4.3 0 .5.1.5.4 0 .2-.2.4-.5.4a.4.4 0 0 1-.4-.4");
    			add_location(path158, file$c, 581, 1, 27927);
    			attr_dev(path159, "fill", "none");
    			attr_dev(path159, "stroke", "#000");
    			attr_dev(path159, "stroke-width", ".3");
    			attr_dev(path159, "d", "M279.8 214.4c0-.3.2-.4.4-.4.3 0 .5.1.5.4 0 .2-.2.4-.5.4a.4.4 0 0 1-.4-.4z");
    			add_location(path159, file$c, 582, 1, 28026);
    			attr_dev(path160, "fill", "#058e6e");
    			attr_dev(path160, "d", "M282.5 214.9h.7a.3.3 0 0 0 .3-.2.3.3 0 0 0-.2-.3l-.7-.1-.7-.1c-.2 0-.3 0-.4.2 0 .2.1.3.3.4h.7");
    			add_location(path160, file$c, 588, 1, 28167);
    			attr_dev(path161, "fill", "none");
    			attr_dev(path161, "stroke", "#000");
    			attr_dev(path161, "stroke-width", ".3");
    			attr_dev(path161, "d", "M282.5 214.9h.7a.3.3 0 0 0 .3-.2.3.3 0 0 0-.2-.3l-.7-.1-.7-.1c-.2 0-.3 0-.4.2 0 .2.1.3.3.4h.7");
    			add_location(path161, file$c, 592, 1, 28295);
    			attr_dev(path162, "fill", "#ad1519");
    			attr_dev(path162, "d", "m285.1 215.4-.2-.5h-.7l.3.6.6-.1");
    			add_location(path162, file$c, 598, 1, 28456);
    			attr_dev(path163, "fill", "none");
    			attr_dev(path163, "stroke", "#000");
    			attr_dev(path163, "stroke-width", ".3");
    			attr_dev(path163, "d", "m285.1 215.4-.2-.5h-.7l.3.6.6-.1");
    			add_location(path163, file$c, 599, 1, 28518);
    			attr_dev(path164, "fill", "#ad1519");
    			attr_dev(path164, "d", "M277.8 217.1a25 25 0 0 1-6-.6 25.4 25.4 0 0 1 6-.7c2.4 0 4.5.3 6.1.7-1.6.4-3.7.6-6 .6");
    			add_location(path164, file$c, 600, 1, 28609);
    			attr_dev(path165, "fill", "none");
    			attr_dev(path165, "stroke", "#000");
    			attr_dev(path165, "stroke-linejoin", "round");
    			attr_dev(path165, "stroke-width", ".3");
    			attr_dev(path165, "d", "M277.8 217.1a25 25 0 0 1-6-.6 25.4 25.4 0 0 1 6-.7c2.4 0 4.5.3 6.1.7-1.6.4-3.7.6-6 .6z");
    			add_location(path165, file$c, 604, 1, 28729);
    			attr_dev(path166, "fill", "#c8b100");
    			attr_dev(path166, "d", "m285.2 212-.1-.3c-.2 0-.3 0-.4.2l.1.4c.2 0 .3 0 .4-.3");
    			add_location(path166, file$c, 611, 1, 28909);
    			attr_dev(path167, "fill", "none");
    			attr_dev(path167, "stroke", "#000");
    			attr_dev(path167, "stroke-width", ".3");
    			attr_dev(path167, "d", "m285.2 212-.1-.3c-.2 0-.3 0-.4.2l.1.4c.2 0 .3 0 .4-.3z");
    			add_location(path167, file$c, 612, 1, 28992);
    			attr_dev(path168, "fill", "#c8b100");
    			attr_dev(path168, "d", "M280.6 211.2c0-.2-.1-.4-.3-.4 0 0-.2.1-.2.3 0 .2 0 .4.2.4l.3-.3");
    			add_location(path168, file$c, 618, 1, 29114);
    			attr_dev(path169, "fill", "none");
    			attr_dev(path169, "stroke", "#000");
    			attr_dev(path169, "stroke-width", ".3");
    			attr_dev(path169, "d", "M280.6 211.2c0-.2-.1-.4-.3-.4 0 0-.2.1-.2.3 0 .2 0 .4.2.4l.3-.3z");
    			add_location(path169, file$c, 619, 1, 29207);
    			attr_dev(path170, "fill", "#c8b100");
    			attr_dev(path170, "d", "M275.2 211.2c0-.2 0-.4.2-.4l.3.3-.2.4c-.2 0-.3-.2-.3-.3");
    			add_location(path170, file$c, 625, 1, 29339);
    			attr_dev(path171, "fill", "none");
    			attr_dev(path171, "stroke", "#000");
    			attr_dev(path171, "stroke-width", ".3");
    			attr_dev(path171, "d", "M275.2 211.2c0-.2 0-.4.2-.4l.3.3-.2.4c-.2 0-.3-.2-.3-.3z");
    			add_location(path171, file$c, 626, 1, 29424);
    			attr_dev(path172, "fill", "#c8b100");
    			attr_dev(path172, "d", "m270.5 212 .1-.3c.2 0 .3 0 .4.2l-.1.4c-.2 0-.3 0-.4-.3");
    			add_location(path172, file$c, 632, 1, 29548);
    			attr_dev(path173, "fill", "none");
    			attr_dev(path173, "stroke", "#000");
    			attr_dev(path173, "stroke-width", ".3");
    			attr_dev(path173, "d", "m270.5 212 .1-.3c.2 0 .3 0 .4.2l-.1.4c-.2 0-.3 0-.4-.3z");
    			add_location(path173, file$c, 633, 1, 29632);
    			attr_dev(path174, "fill", "#c8b100");
    			attr_dev(path174, "d", "m277.8 208.5-.8.5.6 1.3.2.1.3-.1.6-1.3-.9-.5");
    			add_location(path174, file$c, 639, 1, 29755);
    			attr_dev(path175, "fill", "none");
    			attr_dev(path175, "stroke", "#000");
    			attr_dev(path175, "stroke-width", ".3");
    			attr_dev(path175, "d", "m277.8 208.5-.8.5.6 1.3.2.1.3-.1.6-1.3-.9-.5");
    			add_location(path175, file$c, 640, 1, 29829);
    			attr_dev(path176, "fill", "#c8b100");
    			attr_dev(path176, "d", "m276 210.5.4.5 1.3-.4.1-.2-.1-.2-1.3-.3-.4.6");
    			add_location(path176, file$c, 641, 1, 29932);
    			attr_dev(path177, "fill", "none");
    			attr_dev(path177, "stroke", "#000");
    			attr_dev(path177, "stroke-width", ".3");
    			attr_dev(path177, "d", "m276 210.5.4.5 1.3-.4.1-.2-.1-.2-1.3-.3-.4.6");
    			add_location(path177, file$c, 642, 1, 30006);
    			attr_dev(path178, "fill", "#c8b100");
    			attr_dev(path178, "d", "m279.6 210.5-.3.5-1.3-.4-.1-.2v-.2l1.4-.3.4.6");
    			add_location(path178, file$c, 643, 1, 30109);
    			attr_dev(path179, "fill", "none");
    			attr_dev(path179, "stroke", "#000");
    			attr_dev(path179, "stroke-width", ".3");
    			attr_dev(path179, "d", "m279.6 210.5-.3.5-1.3-.4-.1-.2v-.2l1.4-.3.4.6");
    			add_location(path179, file$c, 644, 1, 30184);
    			attr_dev(path180, "fill", "#c8b100");
    			attr_dev(path180, "d", "m272.5 209-.7.7.9 1 .2.1.2-.1.2-1.3-.8-.3");
    			add_location(path180, file$c, 645, 1, 30288);
    			attr_dev(path181, "fill", "none");
    			attr_dev(path181, "stroke", "#000");
    			attr_dev(path181, "stroke-width", ".3");
    			attr_dev(path181, "d", "m272.5 209-.7.7.9 1 .2.1.2-.1.2-1.3-.8-.3");
    			add_location(path181, file$c, 646, 1, 30359);
    			attr_dev(path182, "fill", "#c8b100");
    			attr_dev(path182, "d", "m271.1 211.2.5.5 1.2-.6v-.2l-.1-.2-1.3-.1-.3.6");
    			add_location(path182, file$c, 647, 1, 30459);
    			attr_dev(path183, "fill", "none");
    			attr_dev(path183, "stroke", "#000");
    			attr_dev(path183, "stroke-width", ".3");
    			attr_dev(path183, "d", "m271.1 211.2.5.5 1.2-.6v-.2l-.1-.2-1.3-.1-.3.6");
    			add_location(path183, file$c, 648, 1, 30535);
    			attr_dev(path184, "fill", "#c8b100");
    			attr_dev(path184, "d", "m274.7 210.5-.3.6h-1.3l-.2-.2.1-.3 1.2-.6.5.5");
    			add_location(path184, file$c, 649, 1, 30640);
    			attr_dev(path185, "fill", "none");
    			attr_dev(path185, "stroke", "#000");
    			attr_dev(path185, "stroke-width", ".3");
    			attr_dev(path185, "d", "m274.7 210.5-.3.6h-1.3l-.2-.2.1-.3 1.2-.6.5.5");
    			add_location(path185, file$c, 650, 1, 30715);
    			attr_dev(path186, "fill", "#c8b100");
    			attr_dev(path186, "d", "M269.8 211.4v.6l-1.4.2-.2-.1v-.2l1-.9.6.4");
    			add_location(path186, file$c, 651, 1, 30819);
    			attr_dev(path187, "fill", "none");
    			attr_dev(path187, "stroke", "#000");
    			attr_dev(path187, "stroke-width", ".3");
    			attr_dev(path187, "d", "M269.8 211.4v.6l-1.4.2-.2-.1v-.2l1-.9.6.4");
    			add_location(path187, file$c, 652, 1, 30890);
    			attr_dev(path188, "fill", "#c8b100");
    			attr_dev(path188, "d", "M272.4 210.9c0-.3.2-.5.5-.5a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.4.5.5 0 0 1-.5-.4");
    			add_location(path188, file$c, 653, 1, 30990);
    			attr_dev(path189, "fill", "none");
    			attr_dev(path189, "stroke", "#000");
    			attr_dev(path189, "stroke-width", ".3");
    			attr_dev(path189, "d", "M272.4 210.9c0-.3.2-.5.5-.5a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.4.5.5 0 0 1-.5-.4z");
    			add_location(path189, file$c, 654, 1, 31094);
    			attr_dev(path190, "fill", "#c8b100");
    			attr_dev(path190, "d", "m283.2 209 .7.7-.9 1-.2.1-.1-.1-.3-1.3.8-.3");
    			add_location(path190, file$c, 660, 1, 31237);
    			attr_dev(path191, "fill", "none");
    			attr_dev(path191, "stroke", "#000");
    			attr_dev(path191, "stroke-width", ".3");
    			attr_dev(path191, "d", "m283.2 209 .7.7-.9 1-.2.1-.1-.1-.3-1.3.8-.3");
    			add_location(path191, file$c, 661, 1, 31310);
    			attr_dev(path192, "fill", "#c8b100");
    			attr_dev(path192, "d", "m284.6 211.2-.5.5-1.2-.6v-.2l.1-.2 1.3-.1.3.6");
    			add_location(path192, file$c, 662, 1, 31412);
    			attr_dev(path193, "fill", "none");
    			attr_dev(path193, "stroke", "#000");
    			attr_dev(path193, "stroke-width", ".3");
    			attr_dev(path193, "d", "m284.6 211.2-.5.5-1.2-.6v-.2l.1-.2 1.3-.1.3.6");
    			add_location(path193, file$c, 663, 1, 31487);
    			attr_dev(path194, "fill", "#c8b100");
    			attr_dev(path194, "d", "m281 210.5.3.6h1.3l.2-.2-.1-.3-1.2-.6-.5.5");
    			add_location(path194, file$c, 664, 1, 31591);
    			attr_dev(path195, "fill", "none");
    			attr_dev(path195, "stroke", "#000");
    			attr_dev(path195, "stroke-width", ".3");
    			attr_dev(path195, "d", "m281 210.5.3.6h1.3l.2-.2-.1-.3-1.2-.6-.5.5");
    			add_location(path195, file$c, 665, 1, 31663);
    			attr_dev(path196, "fill", "#c8b100");
    			attr_dev(path196, "d", "M285.7 211.4v.6l1.4.2.2-.1v-.2l-1-.9-.6.4");
    			add_location(path196, file$c, 666, 1, 31764);
    			attr_dev(path197, "fill", "none");
    			attr_dev(path197, "stroke", "#000");
    			attr_dev(path197, "stroke-width", ".3");
    			attr_dev(path197, "d", "M285.7 211.4v.6l1.4.2.2-.1v-.2l-1-.9-.6.4");
    			add_location(path197, file$c, 667, 1, 31835);
    			attr_dev(path198, "fill", "#c8b100");
    			attr_dev(path198, "d", "M277.4 210.4c0-.2.2-.4.5-.4.2 0 .4.2.4.4 0 .3-.2.5-.4.5a.5.5 0 0 1-.5-.5");
    			add_location(path198, file$c, 668, 1, 31935);
    			attr_dev(path199, "fill", "none");
    			attr_dev(path199, "stroke", "#000");
    			attr_dev(path199, "stroke-width", ".3");
    			attr_dev(path199, "d", "M277.4 210.4c0-.2.2-.4.5-.4.2 0 .4.2.4.4 0 .3-.2.5-.4.5a.5.5 0 0 1-.5-.5z");
    			add_location(path199, file$c, 669, 1, 32037);
    			attr_dev(path200, "fill", "#c8b100");
    			attr_dev(path200, "d", "M282.3 210.9c0-.3.3-.5.5-.5.3 0 .5.2.5.5s-.2.4-.5.4a.5.5 0 0 1-.5-.4");
    			add_location(path200, file$c, 675, 1, 32178);
    			attr_dev(path201, "fill", "none");
    			attr_dev(path201, "stroke", "#000");
    			attr_dev(path201, "stroke-width", ".3");
    			attr_dev(path201, "d", "M282.3 210.9c0-.3.3-.5.5-.5.3 0 .5.2.5.5s-.2.4-.5.4a.5.5 0 0 1-.5-.4z");
    			add_location(path201, file$c, 676, 1, 32276);
    			attr_dev(path202, "fill", "#c8b100");
    			attr_dev(path202, "d", "M277 205.4c0-.5.4-.8.8-.8s1 .3 1 .8-.5.8-1 .8a.9.9 0 0 1-.8-.8");
    			add_location(path202, file$c, 682, 1, 32413);
    			attr_dev(path203, "fill", "#c8b100");
    			attr_dev(path203, "d", "M278.5 205.1v.6H277v-.6h.4v-1.3h-.5v-.5h.5v-.6h.6v.6h.6v.6h-.6v1.2h.4");
    			add_location(path203, file$c, 683, 1, 32505);
    			attr_dev(path204, "fill", "none");
    			attr_dev(path204, "stroke", "#000");
    			attr_dev(path204, "stroke-width", ".3");
    			attr_dev(path204, "d", "M278.5 205.1v.6H277v-.6h.4v-1.3h-.5v-.5h.5v-.6h.6v.6h.6v.6h-.6v1.2h.4z");
    			add_location(path204, file$c, 684, 1, 32604);
    			attr_dev(path205, "fill", "#c8b100");
    			attr_dev(path205, "d", "M279 205.1v.6h-2.4v-.6h1v-1.3h-.7v-.5h.6v-.6h.6v.6h.6v.6h-.6v1.2h1");
    			add_location(path205, file$c, 690, 1, 32742);
    			attr_dev(path206, "fill", "none");
    			attr_dev(path206, "stroke", "#000");
    			attr_dev(path206, "stroke-width", ".3");
    			attr_dev(path206, "d", "M278.1 204.6c.4 0 .6.4.6.8 0 .5-.4.8-.9.8a.9.9 0 0 1-.8-.8c0-.4.2-.7.6-.8");
    			add_location(path206, file$c, 691, 1, 32838);
    			attr_dev(path207, "fill", "#c8b100");
    			attr_dev(path207, "d", "m268 212.2-.6-.7a2.3 2.3 0 0 0-.7-.3c0-.1.3-.3.6-.3.2 0 .3 0 .4.2v-.2s.3 0 .4.3v1");
    			add_location(path207, file$c, 697, 1, 32979);
    			attr_dev(path208, "fill", "none");
    			attr_dev(path208, "stroke", "#000");
    			attr_dev(path208, "stroke-width", ".3");
    			attr_dev(path208, "d", "m268 212.2-.6-.7a2.3 2.3 0 0 0-.7-.3c0-.1.3-.3.6-.3.2 0 .3 0 .4.2v-.2s.3 0 .4.3v1z");
    			add_location(path208, file$c, 701, 1, 33095);
    			attr_dev(path209, "fill", "#c8b100");
    			attr_dev(path209, "d", "M268 212c.1-.2.4-.2.5 0 .2.1.3.3.1.5l-.5-.1c-.1-.1-.2-.4 0-.5");
    			add_location(path209, file$c, 707, 1, 33245);
    			attr_dev(path210, "fill", "none");
    			attr_dev(path210, "stroke", "#000");
    			attr_dev(path210, "stroke-width", ".3");
    			attr_dev(path210, "d", "M268 212c.1-.2.4-.2.5 0 .2.1.3.3.1.5l-.5-.1c-.1-.1-.2-.4 0-.5z");
    			add_location(path210, file$c, 708, 1, 33336);
    			attr_dev(path211, "fill", "#c8b100");
    			attr_dev(path211, "d", "m287.5 212.2.6-.7c.2-.2.7-.3.7-.3 0-.1-.3-.3-.6-.3a.6.6 0 0 0-.4.2v-.2s-.3 0-.4.3v.7l.1.3");
    			add_location(path211, file$c, 714, 1, 33466);
    			attr_dev(path212, "fill", "none");
    			attr_dev(path212, "stroke", "#000");
    			attr_dev(path212, "stroke-width", ".3");
    			attr_dev(path212, "d", "m287.5 212.2.6-.7c.2-.2.7-.3.7-.3 0-.1-.3-.3-.6-.3a.6.6 0 0 0-.4.2v-.2s-.3 0-.4.3v.7l.1.3z");
    			add_location(path212, file$c, 718, 1, 33590);
    			attr_dev(path213, "fill", "#c8b100");
    			attr_dev(path213, "d", "M287.5 212c-.1-.2-.3-.2-.5 0-.2.1-.2.3-.1.5l.5-.1c.2-.1.2-.4.1-.5");
    			add_location(path213, file$c, 724, 1, 33748);
    			attr_dev(path214, "fill", "none");
    			attr_dev(path214, "stroke", "#000");
    			attr_dev(path214, "stroke-width", ".3");
    			attr_dev(path214, "d", "M287.5 212c-.1-.2-.3-.2-.5 0-.2.1-.2.3-.1.5l.5-.1c.2-.1.2-.4.1-.5z");
    			add_location(path214, file$c, 725, 1, 33843);
    			attr_dev(path215, "fill", "#c8b100");
    			attr_dev(path215, "d", "M267.2 223h21.4v-5.5h-21.4v5.6z");
    			add_location(path215, file$c, 731, 1, 33977);
    			attr_dev(path216, "fill", "none");
    			attr_dev(path216, "stroke", "#000");
    			attr_dev(path216, "stroke-width", ".4");
    			attr_dev(path216, "d", "M267.2 223h21.4v-5.5h-21.4v5.6z");
    			add_location(path216, file$c, 732, 1, 34038);
    			attr_dev(path217, "fill", "#c8b100");
    			attr_dev(path217, "d", "M286.3 226.8a1 1 0 0 0-.4 0h-16.5c.6-.2 1-.7 1-1.2 0-.6-.4-1.1-1-1.3h17-.1c-.6.2-1 .7-1 1.3 0 .5.4 1 1 1.2");
    			add_location(path217, file$c, 733, 1, 34128);
    			attr_dev(path218, "fill", "none");
    			attr_dev(path218, "stroke", "#000");
    			attr_dev(path218, "stroke-linejoin", "round");
    			attr_dev(path218, "stroke-width", ".4");
    			attr_dev(path218, "d", "M286.3 226.8a1 1 0 0 0-.4 0h-16.5c.6-.2 1-.7 1-1.2 0-.6-.4-1.1-1-1.3h17-.1c-.6.2-1 .7-1 1.3 0 .5.4 1 1 1.2z");
    			add_location(path218, file$c, 737, 1, 34269);
    			attr_dev(path219, "fill", "#c8b100");
    			attr_dev(path219, "d", "M269.9 226.8h16c.6 0 1 .3 1 .7 0 .4-.4.8-1 .8h-16c-.6 0-1-.4-1-.8s.5-.8 1-.8");
    			add_location(path219, file$c, 744, 1, 34470);
    			attr_dev(path220, "fill", "none");
    			attr_dev(path220, "stroke", "#000");
    			attr_dev(path220, "stroke-width", ".4");
    			attr_dev(path220, "d", "M269.9 226.8h16c.6 0 1 .3 1 .7 0 .4-.4.8-1 .8h-16c-.6 0-1-.4-1-.8s.5-.8 1-.8z");
    			add_location(path220, file$c, 745, 1, 34576);
    			attr_dev(path221, "fill", "#c8b100");
    			attr_dev(path221, "d", "M269.9 223h16c.6 0 1 .4 1 .7 0 .4-.4.6-1 .6h-16c-.6 0-1-.2-1-.6 0-.3.4-.6 1-.6");
    			add_location(path221, file$c, 751, 1, 34721);
    			attr_dev(path222, "fill", "none");
    			attr_dev(path222, "stroke", "#000");
    			attr_dev(path222, "stroke-width", ".4");
    			attr_dev(path222, "d", "M269.9 223h16c.6 0 1 .4 1 .7 0 .4-.4.6-1 .6h-16c-.6 0-1-.2-1-.6 0-.3.4-.6 1-.6z");
    			add_location(path222, file$c, 752, 1, 34829);
    			attr_dev(path223, "fill", "#005bbf");
    			attr_dev(path223, "d", "M263 317.4c1.4 0 2.7-.3 3.7-.8a8.4 8.4 0 0 1 3.7-.8c1.4 0 2.8.3 3.8.8s2.3.8 3.7.8c1.5 0 2.8-.3 3.8-.8a8.4 8.4 0 0 1 3.6-.8 8 8 0 0 1 3.7.8c1 .5 2.4.8 3.8.8v2.4a8.3 8.3 0 0 1-3.8-.9 8.2 8.2 0 0 0-3.7-.8c-1.4 0-2.7.3-3.6.8-1 .5-2.3.9-3.8.9a8 8 0 0 1-3.7-.9 8.4 8.4 0 0 0-3.8-.8 8.3 8.3 0 0 0-3.7.8c-1 .5-2.3.9-3.8.9v-2.4");
    			add_location(path223, file$c, 758, 1, 34976);
    			attr_dev(path224, "fill", "none");
    			attr_dev(path224, "stroke", "#000");
    			attr_dev(path224, "stroke-width", ".4");
    			attr_dev(path224, "d", "M263 317.4c1.4 0 2.7-.3 3.7-.8a8.4 8.4 0 0 1 3.7-.8c1.4 0 2.8.3 3.8.8s2.3.8 3.7.8c1.5 0 2.8-.3 3.8-.8a8.4 8.4 0 0 1 3.6-.8 8 8 0 0 1 3.7.8c1 .5 2.4.8 3.8.8v2.4a8.3 8.3 0 0 1-3.8-.9 8.2 8.2 0 0 0-3.7-.8c-1.4 0-2.7.3-3.6.8-1 .5-2.3.9-3.8.9a8 8 0 0 1-3.7-.9 8.4 8.4 0 0 0-3.8-.8 8.3 8.3 0 0 0-3.7.8c-1 .5-2.3.9-3.8.9v-2.4z");
    			add_location(path224, file$c, 762, 1, 35329);
    			attr_dev(path225, "fill", "#ccc");
    			attr_dev(path225, "d", "M263 319.8c1.4 0 2.7-.4 3.7-.9s2.3-.8 3.7-.8c1.4 0 2.8.3 3.8.8s2.3.9 3.7.9a8.2 8.2 0 0 0 3.8-.9 8.4 8.4 0 0 1 3.6-.8c1.5 0 2.8.3 3.7.8 1 .5 2.4.9 3.8.9v2.3a8.3 8.3 0 0 1-3.8-.9 8.1 8.1 0 0 0-3.7-.7c-1.4 0-2.7.2-3.6.7-1 .5-2.3.9-3.8.9a7 7 0 0 1-3.7-.9c-1-.4-2.3-.7-3.8-.7a8.3 8.3 0 0 0-3.7.7 8.1 8.1 0 0 1-3.8.9v-2.3");
    			add_location(path225, file$c, 768, 1, 35716);
    			attr_dev(path226, "fill", "none");
    			attr_dev(path226, "stroke", "#000");
    			attr_dev(path226, "stroke-width", ".4");
    			attr_dev(path226, "d", "M263 319.8c1.4 0 2.7-.4 3.7-.9s2.3-.8 3.7-.8c1.4 0 2.8.3 3.8.8s2.3.9 3.7.9a8.2 8.2 0 0 0 3.8-.9 8.4 8.4 0 0 1 3.6-.8c1.5 0 2.8.3 3.7.8 1 .5 2.4.9 3.8.9v2.3a8.3 8.3 0 0 1-3.8-.9 8.1 8.1 0 0 0-3.7-.7c-1.4 0-2.7.2-3.6.7-1 .5-2.3.9-3.8.9a7 7 0 0 1-3.7-.9c-1-.4-2.3-.7-3.8-.7a8.3 8.3 0 0 0-3.7.7 8.1 8.1 0 0 1-3.8.9v-2.3");
    			add_location(path226, file$c, 772, 1, 36063);
    			attr_dev(path227, "fill", "#005bbf");
    			attr_dev(path227, "d", "M263 322c1.4 0 2.7-.2 3.7-.8 1-.4 2.3-.7 3.7-.7 1.4 0 2.8.2 3.8.7s2.3.9 3.7.9a8.2 8.2 0 0 0 3.8-.9 8.4 8.4 0 0 1 3.6-.8 8 8 0 0 1 3.7.8c1 .5 2.4.9 3.8.9v2.3a8.3 8.3 0 0 1-3.8-.9 8.2 8.2 0 0 0-3.7-.7c-1.4 0-2.7.3-3.6.7-1 .6-2.3.9-3.8.9-1.4 0-2.8-.3-3.7-.8a8.4 8.4 0 0 0-3.8-.8 8.3 8.3 0 0 0-3.7.8c-1 .5-2.3.8-3.8.8V322");
    			add_location(path227, file$c, 778, 1, 36446);
    			attr_dev(path228, "fill", "none");
    			attr_dev(path228, "stroke", "#000");
    			attr_dev(path228, "stroke-width", ".4");
    			attr_dev(path228, "d", "M263 322c1.4 0 2.7-.2 3.7-.8 1-.4 2.3-.7 3.7-.7 1.4 0 2.8.2 3.8.7s2.3.9 3.7.9a8.2 8.2 0 0 0 3.8-.9 8.4 8.4 0 0 1 3.6-.8 8 8 0 0 1 3.7.8c1 .5 2.4.9 3.8.9v2.3a8.3 8.3 0 0 1-3.8-.9 8.2 8.2 0 0 0-3.7-.7c-1.4 0-2.7.3-3.6.7-1 .6-2.3.9-3.8.9-1.4 0-2.8-.3-3.7-.8a8.4 8.4 0 0 0-3.8-.8 8.3 8.3 0 0 0-3.7.8c-1 .5-2.3.8-3.8.8V322");
    			add_location(path228, file$c, 782, 1, 36798);
    			attr_dev(path229, "fill", "#ccc");
    			attr_dev(path229, "d", "M263 326.7a8 8 0 0 0 3.7-.8c1-.5 2.3-.8 3.7-.8 1.4 0 2.8.3 3.8.8s2.3.8 3.7.8c1.5 0 2.8-.3 3.8-.9a8.4 8.4 0 0 1 3.6-.7c1.5 0 2.8.3 3.7.8a8.3 8.3 0 0 0 3.8.8v-2.3a8.3 8.3 0 0 1-3.8-.9 8.2 8.2 0 0 0-3.7-.7c-1.4 0-2.7.3-3.6.7-1 .5-2.3.9-3.8.9-1.4 0-2.8-.3-3.7-.8a8.4 8.4 0 0 0-3.8-.8 8.3 8.3 0 0 0-3.7.8c-1 .5-2.3.8-3.8.8v2.3");
    			add_location(path229, file$c, 788, 1, 37183);
    			attr_dev(path230, "fill", "none");
    			attr_dev(path230, "stroke", "#000");
    			attr_dev(path230, "stroke-width", ".4");
    			attr_dev(path230, "d", "M263 326.7a8 8 0 0 0 3.7-.8c1-.5 2.3-.8 3.7-.8 1.4 0 2.8.3 3.8.8s2.3.8 3.7.8c1.5 0 2.8-.3 3.8-.9a8.4 8.4 0 0 1 3.6-.7c1.5 0 2.8.3 3.7.8a8.3 8.3 0 0 0 3.8.8v-2.3a8.3 8.3 0 0 1-3.8-.9 8.2 8.2 0 0 0-3.7-.7c-1.4 0-2.7.3-3.6.7-1 .5-2.3.9-3.8.9-1.4 0-2.8-.3-3.7-.8a8.4 8.4 0 0 0-3.8-.8 8.3 8.3 0 0 0-3.7.8c-1 .5-2.3.8-3.8.8v2.3");
    			add_location(path230, file$c, 792, 1, 37536);
    			attr_dev(path231, "fill", "#005bbf");
    			attr_dev(path231, "d", "M263 329a8.1 8.1 0 0 0 3.7-.8c1-.5 2.3-.8 3.7-.8 1.4 0 2.8.3 3.8.8s2.3.8 3.7.8a8.2 8.2 0 0 0 3.8-.9 8.4 8.4 0 0 1 3.6-.7c1.5 0 2.8.3 3.7.8 1 .5 2.4.8 3.8.8v-2.3a8.3 8.3 0 0 1-3.8-.8 8.2 8.2 0 0 0-3.7-.8 8.4 8.4 0 0 0-3.6.7 8.2 8.2 0 0 1-3.8.9c-1.4 0-2.8-.3-3.7-.8-1-.5-2.3-.8-3.8-.8-1.4 0-2.7.3-3.7.8s-2.3.8-3.8.8v2.3");
    			add_location(path231, file$c, 798, 1, 37925);
    			attr_dev(path232, "fill", "none");
    			attr_dev(path232, "stroke", "#000");
    			attr_dev(path232, "stroke-width", ".4");
    			attr_dev(path232, "d", "M263 329a8.1 8.1 0 0 0 3.7-.8c1-.5 2.3-.8 3.7-.8 1.4 0 2.8.3 3.8.8s2.3.8 3.7.8a8.2 8.2 0 0 0 3.8-.9 8.4 8.4 0 0 1 3.6-.7c1.5 0 2.8.3 3.7.8 1 .5 2.4.8 3.8.8v-2.3a8.3 8.3 0 0 1-3.8-.8 8.2 8.2 0 0 0-3.7-.8 8.4 8.4 0 0 0-3.6.7 8.2 8.2 0 0 1-3.8.9c-1.4 0-2.8-.3-3.7-.8-1-.5-2.3-.8-3.8-.8-1.4 0-2.7.3-3.7.8s-2.3.8-3.8.8v2.3z");
    			add_location(path232, file$c, 802, 1, 38277);
    			attr_dev(path233, "fill", "#c8b100");
    			attr_dev(path233, "d", "m286.3 308-.1.5c0 1.5 1.2 2.6 2.7 2.6h-22c1.5 0 2.7-1.2 2.7-2.6l-.1-.5h16.8");
    			add_location(path233, file$c, 808, 1, 38663);
    			attr_dev(path234, "fill", "none");
    			attr_dev(path234, "stroke", "#000");
    			attr_dev(path234, "stroke-linejoin", "round");
    			attr_dev(path234, "stroke-width", ".4");
    			attr_dev(path234, "d", "m286.3 308-.1.5c0 1.5 1.2 2.6 2.7 2.6h-22c1.5 0 2.7-1.2 2.7-2.6l-.1-.5h16.8z");
    			add_location(path234, file$c, 809, 1, 38768);
    			attr_dev(path235, "fill", "#c8b100");
    			attr_dev(path235, "d", "M269.9 306.5h16c.6 0 1 .3 1 .8 0 .4-.4.7-1 .7h-16c-.6 0-1-.3-1-.8 0-.4.5-.7 1-.7");
    			add_location(path235, file$c, 816, 1, 38938);
    			attr_dev(path236, "fill", "none");
    			attr_dev(path236, "stroke", "#000");
    			attr_dev(path236, "stroke-width", ".4");
    			attr_dev(path236, "d", "M269.9 306.5h16c.6 0 1 .3 1 .8 0 .4-.4.7-1 .7h-16c-.6 0-1-.3-1-.8 0-.4.5-.7 1-.7z");
    			add_location(path236, file$c, 817, 1, 39048);
    			attr_dev(path237, "fill", "#c8b100");
    			attr_dev(path237, "d", "M266.9 316.7h22V311h-22v5.6z");
    			add_location(path237, file$c, 823, 1, 39197);
    			attr_dev(path238, "fill", "none");
    			attr_dev(path238, "stroke", "#000");
    			attr_dev(path238, "stroke-width", ".4");
    			attr_dev(path238, "d", "M266.9 316.7h22V311h-22v5.6z");
    			add_location(path238, file$c, 824, 1, 39255);
    			attr_dev(path239, "fill", "#ad1519");
    			attr_dev(path239, "d", "M290.6 286.7c2.1 1.2 3.6 2.5 3.4 3.2-.1.6-.8 1-1.8 1.6-1.6 1.1-2.5 3-1.8 4a5.5 5.5 0 0 1 .2-8.8");
    			add_location(path239, file$c, 825, 1, 39342);
    			attr_dev(path240, "fill", "none");
    			attr_dev(path240, "stroke", "#000");
    			attr_dev(path240, "stroke-width", ".4");
    			attr_dev(path240, "d", "M290.6 286.7c2.1 1.2 3.6 2.5 3.4 3.2-.1.6-.8 1-1.8 1.6-1.6 1.1-2.5 3-1.8 4a5.5 5.5 0 0 1 .2-8.8z");
    			add_location(path240, file$c, 829, 1, 39472);
    			attr_dev(path241, "fill", "#ccc");
    			attr_dev(path241, "d", "M270.1 305.6h15.6V229h-15.6v76.5z");
    			add_location(path241, file$c, 835, 1, 39636);
    			attr_dev(path242, "fill", "none");
    			attr_dev(path242, "stroke", "#000");
    			attr_dev(path242, "stroke-width", ".4");
    			attr_dev(path242, "d", "M281.4 229.1v76.3m1.8-76.3v76.3m-13 .2h15.5V229h-15.6v76.5z");
    			add_location(path242, file$c, 836, 1, 39696);
    			attr_dev(path243, "fill", "#ad1519");
    			attr_dev(path243, "d", "M254.2 257.7a49.6 49.6 0 0 1 23.3-2c9.3 1.6 16.4 5.3 15.9 8.4v.2l3.5-8.2c.6-3.3-7.3-7.5-17.6-9.2a53.5 53.5 0 0 0-9.2-.7c-6.7 0-12.4.8-15.9 2.1v9.4");
    			add_location(path243, file$c, 842, 1, 39823);
    			attr_dev(path244, "fill", "none");
    			attr_dev(path244, "stroke", "#000");
    			attr_dev(path244, "stroke-linejoin", "round");
    			attr_dev(path244, "stroke-width", ".4");
    			attr_dev(path244, "d", "M254.2 257.7a49.6 49.6 0 0 1 23.3-2c9.3 1.6 16.4 5.3 15.9 8.4v.2l3.5-8.2c.6-3.3-7.3-7.5-17.6-9.2a53.5 53.5 0 0 0-9.2-.7c-6.7 0-12.4.8-15.9 2.1v9.4");
    			add_location(path244, file$c, 846, 1, 40004);
    			attr_dev(path245, "fill", "#ad1519");
    			attr_dev(path245, "d", "M285.7 267.3c4.4-.3 7.3-1.4 7.7-3.2.2-1.5-1.2-3-3.8-4.5-1.2.1-2.5.3-3.9.3v7.4");
    			add_location(path245, file$c, 853, 1, 40244);
    			attr_dev(path246, "fill", "none");
    			attr_dev(path246, "stroke", "#000");
    			attr_dev(path246, "stroke-width", ".4");
    			attr_dev(path246, "d", "M285.7 267.3c4.4-.3 7.3-1.4 7.7-3.2.2-1.5-1.2-3-3.8-4.5-1.2.1-2.5.3-3.9.3v7.4");
    			add_location(path246, file$c, 854, 1, 40351);
    			attr_dev(path247, "fill", "#ad1519");
    			attr_dev(path247, "d", "M270 261.5a13 13 0 0 0-5.7 1.9v.2c-.5 1 1.8 3 5.8 5.4v-7.5");
    			add_location(path247, file$c, 860, 1, 40496);
    			attr_dev(path248, "fill", "none");
    			attr_dev(path248, "stroke", "#000");
    			attr_dev(path248, "stroke-width", ".4");
    			attr_dev(path248, "d", "M270 261.5a13 13 0 0 0-5.7 1.9v.2c-.5 1 1.8 3 5.8 5.4v-7.5");
    			add_location(path248, file$c, 861, 1, 40584);
    			attr_dev(path249, "fill", "#ad1519");
    			attr_dev(path249, "d", "M295.4 282c.4-1.2-3.8-3.6-9.7-5.8-2.8-1-5-2-7.8-3.2-8.3-3.7-14.4-7.9-13.6-9.4v-.2c-.4.4-1 8-1 8-.8 1.3 4.8 5.5 12.4 9.1 2.4 1.2 7.6 3 10 4 4.3 1.4 8.7 4.3 8.3 5.3l1.4-7.7");
    			add_location(path249, file$c, 867, 1, 40710);
    			attr_dev(path250, "fill", "none");
    			attr_dev(path250, "stroke", "#000");
    			attr_dev(path250, "stroke-linejoin", "round");
    			attr_dev(path250, "stroke-width", ".4");
    			attr_dev(path250, "d", "M295.4 282c.4-1.2-3.8-3.6-9.7-5.8-2.8-1-5-2-7.8-3.2-8.3-3.7-14.4-7.9-13.6-9.4v-.2c-.4.4-1 8-1 8-.8 1.3 4.8 5.5 12.4 9.1 2.4 1.2 7.6 3 10 4 4.3 1.4 8.7 4.3 8.3 5.3l1.4-7.7z");
    			add_location(path250, file$c, 871, 1, 40915);
    			attr_dev(path251, "fill", "#c8b100");
    			attr_dev(path251, "d", "M263.9 254.4c.6-2.3 1.4-4.4 2.1-6.6h-.5a5.2 5.2 0 0 1-.5.1 52.8 52.8 0 0 1-1.4 4.8c-1-1.4-2-2.7-2.7-4.1l-1 .2h-1a131.3 131.3 0 0 1 4 5.7h.5l.5-.1m6-6.6h-1a8 8 0 0 1-.8 0v6.2h4.2v-.7h-2.6l.1-5.5m6.8 1 2 .3v-.7l-5.8-.5v.8a19.3 19.3 0 0 1 2 0l-.4 5.6h1.6l.5-5.4m2.4 6c.3 0 .5 0 .8.2l.8.2.7-2.9.6 1.2.8 2.1 1 .2c.4 0 .7.2 1 .3l-.3-.7c-.4-1-1-1.9-1.3-2.9 1 0 1.9-.3 2.1-1.2.1-.6 0-1-.7-1.5-.4-.3-1.2-.4-1.7-.5l-2.4-.5-1.4 6m3-5.2c.7.2 1.5.3 1.5 1v.5c-.3.9-1 1.2-2 .9l.5-2.4m8 7-.2 2 .8.5.9.5.5-7a3.4 3.4 0 0 1-.7-.3l-6.1 3.8.5.3.4.2 1.7-1.2 2.3 1.3zm-1.7-1.5 2-1.4-.2 2.3-1.8-1");
    			add_location(path251, file$c, 878, 1, 41180);
    			attr_dev(path252, "fill", "none");
    			attr_dev(path252, "stroke", "#000");
    			attr_dev(path252, "stroke-width", ".1");
    			attr_dev(path252, "d", "M182.2 192.4c0-1 1-2 2-2s2.2 1 2.2 2c0 1.1-1 2-2.1 2a2 2 0 0 1-2.1-2z");
    			add_location(path252, file$c, 882, 1, 41787);
    			attr_dev(path253, "fill", "#ad1519");
    			attr_dev(path253, "stroke", "#000");
    			attr_dev(path253, "stroke-width", ".3");
    			attr_dev(path253, "d", "M205.7 175.4c6.3 0 12 1 15.7 2.4a31.7 31.7 0 0 0 14.6 2.3c2.7 0 6.5.8 10.3 2.4a27.3 27.3 0 0 1 7.4 4.7l-1.5 1.4-.4 3.8-4.1 4.7-2 1.8-5 3.9-2.5.2-.7 2.1-31.6-3.7-31.7 3.7-.8-2.1-2.5-.2-4.9-4-2-1.7-4.1-4.7-.5-3.8-1.5-1.4a27.6 27.6 0 0 1 7.5-4.7 26 26 0 0 1 10.2-2.4c2 .2 4.2.1 6.6-.2a30 30 0 0 0 8-2c3.7-1.5 9-2.5 15.5-2.5z");
    			add_location(path253, file$c, 888, 1, 41924);
    			attr_dev(path254, "fill", "#c8b100");
    			attr_dev(path254, "stroke", "#000");
    			attr_dev(path254, "stroke-width", ".4");
    			attr_dev(path254, "d", "M206.2 217.1c-11.8 0-22.4-1.4-29.9-3.6a1.1 1.1 0 0 1-.8-1.2c0-.5.3-1 .8-1.2a109 109 0 0 1 29.9-3.6c11.7 0 22.3 1.4 29.8 3.6a1.3 1.3 0 0 1 0 2.4c-7.5 2.2-18 3.6-29.8 3.6");
    			add_location(path254, file$c, 894, 1, 42316);
    			attr_dev(path255, "fill", "#ad1519");
    			attr_dev(path255, "d", "M206.1 215.6c-10.6 0-20.2-1.2-27.5-3.1 7.3-2 16.9-3 27.5-3.1a115 115 0 0 1 27.6 3c-7.3 2-17 3.2-27.6 3.2");
    			add_location(path255, file$c, 900, 1, 42555);
    			attr_dev(path256, "fill", "none");
    			attr_dev(path256, "stroke", "#000");
    			attr_dev(path256, "stroke-width", ".1");
    			attr_dev(path256, "d", "M206.9 215.7v-6.3m-1.7 6.3v-6.3");
    			add_location(path256, file$c, 904, 1, 42694);
    			attr_dev(path257, "fill", "none");
    			attr_dev(path257, "stroke", "#000");
    			attr_dev(path257, "stroke-width", ".2");
    			attr_dev(path257, "d", "M203.6 215.7v-6.3m-1.6 6.3v-6.3");
    			add_location(path257, file$c, 905, 1, 42784);
    			attr_dev(path258, "fill", "none");
    			attr_dev(path258, "stroke", "#000");
    			attr_dev(path258, "stroke-width", ".3");
    			attr_dev(path258, "d", "M200.6 215.7v-6.3m-2.8 5.9v-5.7m1.3 5.8v-6m-3.8 5.6v-5.2m1.3 5.4v-5.6");
    			add_location(path258, file$c, 906, 1, 42874);
    			attr_dev(path259, "fill", "none");
    			attr_dev(path259, "stroke", "#000");
    			attr_dev(path259, "stroke-width", ".4");
    			attr_dev(path259, "d", "M192 214.8V210m1 4.7V210m1.2 5v-5m-3.4 4.7v-4.5");
    			add_location(path259, file$c, 912, 1, 43011);
    			attr_dev(path260, "fill", "none");
    			attr_dev(path260, "stroke", "#000");
    			attr_dev(path260, "stroke-width", ".5");
    			attr_dev(path260, "d", "M189.7 214.5v-4.2m-1.2 4.1v-4");
    			add_location(path260, file$c, 913, 1, 43117);
    			attr_dev(path261, "fill", "none");
    			attr_dev(path261, "stroke", "#000");
    			attr_dev(path261, "stroke-width", ".6");
    			attr_dev(path261, "d", "M186 214v-3m1.3 3.2v-3.5m-2.5 3.1V211");
    			add_location(path261, file$c, 914, 1, 43205);
    			attr_dev(path262, "fill", "none");
    			attr_dev(path262, "stroke", "#000");
    			attr_dev(path262, "stroke-width", ".7");
    			attr_dev(path262, "d", "M183.7 213.6v-2.3m-1.3 2v-1.8m-1.2 1.6v-1.3");
    			add_location(path262, file$c, 915, 1, 43301);
    			attr_dev(path263, "fill", "none");
    			attr_dev(path263, "stroke", "#000");
    			attr_dev(path263, "stroke-width", ".9");
    			attr_dev(path263, "d", "M179.8 212.8v-.7");
    			add_location(path263, file$c, 916, 1, 43403);
    			attr_dev(path264, "fill", "none");
    			attr_dev(path264, "stroke", "#000");
    			attr_dev(path264, "stroke-width", ".1");
    			attr_dev(path264, "d", "M213.7 215.3v-5.8m-2.9 6v-6.1m-2.1 6.2v-6.3");
    			add_location(path264, file$c, 917, 1, 43478);
    			attr_dev(path265, "fill", "#c8b100");
    			attr_dev(path265, "stroke", "#000");
    			attr_dev(path265, "stroke-width", ".4");
    			attr_dev(path265, "d", "M206 207.4a108 108 0 0 0-30 3.9c.6-.3.5-1-.3-3-1-2.5-2.4-2.4-2.4-2.4 8.3-2.5 20-4 32.8-4a123 123 0 0 1 33 4s-1.5-.1-2.5 2.3c-.8 2-.8 2.8-.2 3-7.5-2.2-18.4-3.7-30.3-3.7");
    			add_location(path265, file$c, 918, 1, 43580);
    			attr_dev(path266, "fill", "#c8b100");
    			attr_dev(path266, "stroke", "#000");
    			attr_dev(path266, "stroke-width", ".4");
    			attr_dev(path266, "d", "M206.1 201.9c-12.9 0-24.5 1.5-32.8 4a1 1 0 0 1-1.3-.6 1 1 0 0 1 .7-1.3 121 121 0 0 1 33.4-4.2c13.2 0 25.2 1.7 33.5 4.2.6.2.9.8.7 1.3-.2.5-.8.8-1.3.6-8.4-2.5-20-4-32.9-4");
    			add_location(path266, file$c, 924, 1, 43818);
    			attr_dev(path267, "fill", "none");
    			attr_dev(path267, "stroke", "#000");
    			attr_dev(path267, "stroke-linejoin", "round");
    			attr_dev(path267, "stroke-width", ".4");
    			attr_dev(path267, "d", "M206.1 215.6c-10.6 0-20.2-1.2-27.5-3.1 7.3-2 16.9-3 27.5-3.1a115 115 0 0 1 27.6 3c-7.3 2-17 3.2-27.6 3.2z");
    			add_location(path267, file$c, 930, 1, 44057);
    			attr_dev(path268, "fill", "#fff");
    			attr_dev(path268, "stroke", "#000");
    			attr_dev(path268, "stroke-width", ".4");
    			attr_dev(path268, "d", "M197 204.8c0-.5.4-1 1-1 .5 0 1 .5 1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path268, file$c, 937, 1, 44256);
    			attr_dev(path269, "fill", "#ad1519");
    			attr_dev(path269, "stroke", "#000");
    			attr_dev(path269, "stroke-width", ".4");
    			attr_dev(path269, "d", "M206.1 205.6H203a1 1 0 0 1 0-2h6.4c.5 0 1 .5 1 1s-.5 1-1 1h-3.2");
    			add_location(path269, file$c, 943, 1, 44385);
    			attr_dev(path270, "fill", "#058e6e");
    			attr_dev(path270, "stroke", "#000");
    			attr_dev(path270, "stroke-width", ".4");
    			attr_dev(path270, "d", "m190.3 206.5-2.3.2c-.6.1-1-.3-1.2-.8a1 1 0 0 1 1-1.1l2.2-.3 2.4-.3c.5 0 1 .3 1.1.9.1.5-.3 1-.9 1l-2.3.4");
    			add_location(path270, file$c, 949, 1, 44519);
    			attr_dev(path271, "fill", "#fff");
    			attr_dev(path271, "stroke", "#000");
    			attr_dev(path271, "stroke-width", ".4");
    			attr_dev(path271, "d", "M181 206.7c0-.6.5-1 1.1-1 .6 0 1 .4 1 1 0 .5-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path271, file$c, 955, 1, 44693);
    			attr_dev(path272, "fill", "#ad1519");
    			attr_dev(path272, "stroke", "#000");
    			attr_dev(path272, "stroke-width", ".4");
    			attr_dev(path272, "d", "m174 208.5 1.2-1.6 3.3.4-2.6 2-1.8-.8");
    			add_location(path272, file$c, 961, 1, 44828);
    			attr_dev(path273, "fill", "#058e6e");
    			attr_dev(path273, "stroke", "#000");
    			attr_dev(path273, "stroke-width", ".4");
    			attr_dev(path273, "d", "m222 206.5 2.3.2c.5.1 1-.3 1.1-.8a1 1 0 0 0-.9-1.1l-2.2-.3-2.4-.3a1 1 0 0 0-1.1.9c-.1.5.3 1 .9 1l2.3.4");
    			add_location(path273, file$c, 962, 1, 44927);
    			attr_dev(path274, "fill", "#fff");
    			attr_dev(path274, "stroke", "#000");
    			attr_dev(path274, "stroke-width", ".4");
    			attr_dev(path274, "d", "M213.3 204.8c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1m15.8 1.9c0-.6.5-1 1-1 .6 0 1.1.4 1.1 1 0 .5-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path274, file$c, 968, 1, 45100);
    			attr_dev(path275, "fill", "#ad1519");
    			attr_dev(path275, "stroke", "#000");
    			attr_dev(path275, "stroke-width", ".4");
    			attr_dev(path275, "d", "m238.2 208.5-1.1-1.6-3.3.4 2.6 2 1.8-.8");
    			add_location(path275, file$c, 974, 1, 45292);
    			attr_dev(path276, "fill", "none");
    			attr_dev(path276, "stroke", "#000");
    			attr_dev(path276, "stroke-width", ".4");
    			attr_dev(path276, "d", "M177.3 212.8c7.4-2.1 17.6-3.4 28.8-3.4 11.3 0 21.4 1.3 28.9 3.4");
    			add_location(path276, file$c, 975, 1, 45393);
    			attr_dev(path277, "fill", "#c8b100");
    			attr_dev(path277, "d", "m182.3 183.8 1.4 1 2-3.2a7.4 7.4 0 0 1-3.6-7.2c.2-4.1 5.2-7.6 11.7-7.6 3.3 0 6.3 1 8.5 2.4 0-.6 0-1.2.2-1.8a17.4 17.4 0 0 0-8.7-2.1c-7.4 0-13.2 4.1-13.5 9.1a8.9 8.9 0 0 0 3 7.6l-1 1.8");
    			add_location(path277, file$c, 981, 1, 45524);
    			attr_dev(path278, "fill", "none");
    			attr_dev(path278, "stroke", "#000");
    			attr_dev(path278, "stroke-width", ".4");
    			attr_dev(path278, "d", "m182.3 183.8 1.4 1 2-3.2a7.4 7.4 0 0 1-3.6-7.2c.2-4.1 5.2-7.6 11.7-7.6 3.3 0 6.3 1 8.5 2.4 0-.6 0-1.2.2-1.8a17.4 17.4 0 0 0-8.7-2.1c-7.4 0-13.2 4.1-13.5 9.1a8.9 8.9 0 0 0 3 7.6l-1 1.8");
    			add_location(path278, file$c, 985, 1, 45742);
    			attr_dev(path279, "fill", "#c8b100");
    			attr_dev(path279, "d", "M182.4 183.8a9.3 9.3 0 0 1-4-7.3c0-3.2 2-6.1 5.3-8a8.5 8.5 0 0 0-3.4 6.8 8.9 8.9 0 0 0 3 6.7l-.9 1.8");
    			add_location(path279, file$c, 991, 1, 45993);
    			attr_dev(path280, "fill", "none");
    			attr_dev(path280, "stroke", "#000");
    			attr_dev(path280, "stroke-width", ".4");
    			attr_dev(path280, "d", "M182.4 183.8a9.3 9.3 0 0 1-4-7.3c0-3.2 2-6.1 5.3-8a8.5 8.5 0 0 0-3.4 6.8 8.9 8.9 0 0 0 3 6.7l-.9 1.8");
    			add_location(path280, file$c, 995, 1, 46128);
    			attr_dev(path281, "fill", "#c8b100");
    			attr_dev(path281, "d", "M160.1 187.1a8.8 8.8 0 0 1-2.3-5.9c0-1.3.3-2.6 1-3.8 2-4.2 8.4-7.2 16-7.2 2 0 4 .2 5.9.6l-1 1.4a25.5 25.5 0 0 0-4.9-.4c-7 0-12.8 2.7-14.5 6.3a7 7 0 0 0-.7 3.1 7.3 7.3 0 0 0 2.7 5.6l-2.6 4.1-1.3-1 1.7-2.8");
    			add_location(path281, file$c, 1001, 1, 46296);
    			attr_dev(path282, "fill", "none");
    			attr_dev(path282, "stroke", "#000");
    			attr_dev(path282, "stroke-width", ".4");
    			attr_dev(path282, "d", "M160.1 187.1a8.8 8.8 0 0 1-2.3-5.9c0-1.3.3-2.6 1-3.8 2-4.2 8.4-7.2 16-7.2 2 0 4 .2 5.9.6l-1 1.4a25.5 25.5 0 0 0-4.9-.4c-7 0-12.8 2.7-14.5 6.3a7 7 0 0 0-.7 3.1 7.3 7.3 0 0 0 2.7 5.6l-2.6 4.1-1.3-1 1.7-2.8z");
    			add_location(path282, file$c, 1005, 1, 46534);
    			attr_dev(path283, "fill", "#c8b100");
    			attr_dev(path283, "d", "M162.7 173.3a10.5 10.5 0 0 0-4 4.1 8.6 8.6 0 0 0-.9 3.8c0 2.3.9 4.3 2.3 5.9l-1.5 2.5a10.4 10.4 0 0 1-2.3-6.5c0-4 2.5-7.5 6.4-9.8");
    			add_location(path283, file$c, 1011, 1, 46806);
    			attr_dev(path284, "fill", "none");
    			attr_dev(path284, "stroke", "#000");
    			attr_dev(path284, "stroke-width", ".4");
    			attr_dev(path284, "d", "M162.7 173.3a10.5 10.5 0 0 0-4 4.1 8.6 8.6 0 0 0-.9 3.8c0 2.3.9 4.3 2.3 5.9l-1.5 2.5a10.4 10.4 0 0 1-2.3-6.5c0-4 2.5-7.5 6.4-9.8z");
    			add_location(path284, file$c, 1015, 1, 46969);
    			attr_dev(path285, "fill", "#c8b100");
    			attr_dev(path285, "d", "M206 164.4c1.7 0 3.2 1.1 3.5 2.6.3 1.4.4 2.9.4 4.5v1.1c.1 3.3.6 6.3 1.3 8.1l-5.2 5-5.2-5c.7-1.8 1.2-4.8 1.3-8.1v-1.1c0-1.6.2-3.1.4-4.5.3-1.5 1.8-2.6 3.5-2.6");
    			add_location(path285, file$c, 1021, 1, 47166);
    			attr_dev(path286, "fill", "none");
    			attr_dev(path286, "stroke", "#000");
    			attr_dev(path286, "stroke-width", ".4");
    			attr_dev(path286, "d", "M206 164.4c1.7 0 3.2 1.1 3.5 2.6.3 1.4.4 2.9.4 4.5v1.1c.1 3.3.6 6.3 1.3 8.1l-5.2 5-5.2-5c.7-1.8 1.2-4.8 1.3-8.1v-1.1c0-1.6.2-3.1.4-4.5.3-1.5 1.8-2.6 3.5-2.6z");
    			add_location(path286, file$c, 1025, 1, 47357);
    			attr_dev(path287, "fill", "#c8b100");
    			attr_dev(path287, "d", "M206 166c1 0 1.7.6 1.8 1.4.2 1.2.4 2.6.4 4.2v1c.1 3.2.6 6 1.2 7.7l-3.4 3.2-3.4-3.2c.7-1.7 1.1-4.5 1.2-7.7v-1a28.1 28.1 0 0 1 .4-4.2 2 2 0 0 1 1.8-1.4");
    			add_location(path287, file$c, 1031, 1, 47582);
    			attr_dev(path288, "fill", "none");
    			attr_dev(path288, "stroke", "#000");
    			attr_dev(path288, "stroke-width", ".4");
    			attr_dev(path288, "d", "M206 166c1 0 1.7.6 1.8 1.4.2 1.2.4 2.6.4 4.2v1c.1 3.2.6 6 1.2 7.7l-3.4 3.2-3.4-3.2c.7-1.7 1.1-4.5 1.2-7.7v-1a28.1 28.1 0 0 1 .4-4.2 2 2 0 0 1 1.8-1.4z");
    			add_location(path288, file$c, 1035, 1, 47766);
    			attr_dev(path289, "fill", "#c8b100");
    			attr_dev(path289, "d", "m229.7 183.8-1.3 1-2-3.2a7.4 7.4 0 0 0 3.6-6.3 7 7 0 0 0 0-.9c-.2-4.1-5.3-7.6-11.7-7.6a15 15 0 0 0-8.5 2.4 23 23 0 0 0-.2-1.8 17.4 17.4 0 0 1 8.7-2.1c7.4 0 13.2 4.1 13.4 9.1a8.9 8.9 0 0 1-3 7.6l1 1.8");
    			add_location(path289, file$c, 1041, 1, 47984);
    			attr_dev(path290, "fill", "none");
    			attr_dev(path290, "stroke", "#000");
    			attr_dev(path290, "stroke-width", ".4");
    			attr_dev(path290, "d", "m229.7 183.8-1.3 1-2-3.2a7.4 7.4 0 0 0 3.6-6.3 7 7 0 0 0 0-.9c-.2-4.1-5.3-7.6-11.7-7.6a15 15 0 0 0-8.5 2.4 23 23 0 0 0-.2-1.8 17.4 17.4 0 0 1 8.7-2.1c7.4 0 13.2 4.1 13.4 9.1a8.9 8.9 0 0 1-3 7.6l1 1.8");
    			add_location(path290, file$c, 1045, 1, 48218);
    			attr_dev(path291, "fill", "#c8b100");
    			attr_dev(path291, "d", "M229.6 183.8a9.1 9.1 0 0 0 4.1-7.3c0-3.2-2.1-6.1-5.3-8a8.5 8.5 0 0 1 3.4 6.8 8.9 8.9 0 0 1-3.2 6.7l1 1.8");
    			add_location(path291, file$c, 1051, 1, 48485);
    			attr_dev(path292, "fill", "none");
    			attr_dev(path292, "stroke", "#000");
    			attr_dev(path292, "stroke-width", ".4");
    			attr_dev(path292, "d", "M229.6 183.8a9.1 9.1 0 0 0 4.1-7.3c0-3.2-2.1-6.1-5.3-8a8.5 8.5 0 0 1 3.4 6.8 8.9 8.9 0 0 1-3.2 6.7l1 1.8");
    			add_location(path292, file$c, 1055, 1, 48624);
    			attr_dev(path293, "fill", "#c8b100");
    			attr_dev(path293, "d", "M252 187.1a8.8 8.8 0 0 0 2.2-5.9 8.7 8.7 0 0 0-.9-3.8c-2-4.2-8.4-7.2-16-7.2a29 29 0 0 0-6 .6l1 1.4a25.4 25.4 0 0 1 5-.4c7 0 12.8 2.7 14.4 6.3.5 1 .7 2 .7 3.1a7.3 7.3 0 0 1-2.6 5.6l2.5 4.1 1.3-1-1.7-2.8");
    			add_location(path293, file$c, 1061, 1, 48796);
    			attr_dev(path294, "fill", "none");
    			attr_dev(path294, "stroke", "#000");
    			attr_dev(path294, "stroke-width", ".4");
    			attr_dev(path294, "d", "M252 187.1a8.8 8.8 0 0 0 2.2-5.9 8.7 8.7 0 0 0-.9-3.8c-2-4.2-8.4-7.2-16-7.2a29 29 0 0 0-6 .6l1 1.4a25.4 25.4 0 0 1 5-.4c7 0 12.8 2.7 14.4 6.3.5 1 .7 2 .7 3.1a7.3 7.3 0 0 1-2.6 5.6l2.5 4.1 1.3-1-1.7-2.8z");
    			add_location(path294, file$c, 1065, 1, 49032);
    			attr_dev(path295, "fill", "#c8b100");
    			attr_dev(path295, "d", "M249.3 173.3a10.6 10.6 0 0 1 4 4.1 8.7 8.7 0 0 1 .9 3.8 8.8 8.8 0 0 1-2.3 5.9l1.6 2.5a10.4 10.4 0 0 0 2.3-6.5c0-4-2.6-7.5-6.5-9.8");
    			add_location(path295, file$c, 1071, 1, 49302);
    			attr_dev(path296, "fill", "none");
    			attr_dev(path296, "stroke", "#000");
    			attr_dev(path296, "stroke-width", ".4");
    			attr_dev(path296, "d", "M249.3 173.3a10.6 10.6 0 0 1 4 4.1 8.7 8.7 0 0 1 .9 3.8 8.8 8.8 0 0 1-2.3 5.9l1.6 2.5a10.4 10.4 0 0 0 2.3-6.5c0-4-2.6-7.5-6.5-9.8z");
    			add_location(path296, file$c, 1075, 1, 49466);
    			attr_dev(path297, "fill", "#fff");
    			attr_dev(path297, "d", "M204.2 181.4c0-1 .8-1.8 1.8-1.8s1.9.8 1.9 1.8-.9 1.7-1.9 1.7a1.8 1.8 0 0 1-1.8-1.7");
    			add_location(path297, file$c, 1081, 1, 49664);
    			attr_dev(path298, "fill", "none");
    			attr_dev(path298, "stroke", "#000");
    			attr_dev(path298, "stroke-width", ".4");
    			attr_dev(path298, "d", "M204.2 181.4c0-1 .8-1.8 1.8-1.8s1.9.8 1.9 1.8-.9 1.7-1.9 1.7a1.8 1.8 0 0 1-1.8-1.7z");
    			add_location(path298, file$c, 1082, 1, 49773);
    			attr_dev(path299, "fill", "#fff");
    			attr_dev(path299, "stroke", "#000");
    			attr_dev(path299, "stroke-width", ".4");
    			attr_dev(path299, "d", "M204.2 178c0-1 .8-1.8 1.8-1.8s1.9.8 1.9 1.8-.9 1.7-1.9 1.7a1.8 1.8 0 0 1-1.8-1.7m.4-3.7c0-.7.6-1.3 1.4-1.3.8 0 1.5.6 1.5 1.3 0 .8-.7 1.4-1.5 1.4s-1.4-.6-1.4-1.4m.4-3.3c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1m.2-2.8c0-.5.4-.8.8-.8.5 0 .9.3.9.8 0 .4-.4.8-.9.8a.8.8 0 0 1-.8-.8");
    			add_location(path299, file$c, 1088, 1, 49924);
    			attr_dev(path300, "fill", "#c8b100");
    			attr_dev(path300, "stroke", "#000");
    			attr_dev(path300, "stroke-width", ".4");
    			attr_dev(path300, "d", "m206.2 191.8 1.2.2a4.6 4.6 0 0 0 4.5 6 4.7 4.7 0 0 0 4.4-3c.1 0 .5-1.7.7-1.7.2 0 .1 1.8.2 1.7.3 2.3 2.4 3.8 4.7 3.8a4.6 4.6 0 0 0 4.7-5l1.5-1.5.7 2a4 4 0 0 0-.4 1.9 4.4 4.4 0 0 0 4.5 4.2c1.6 0 3-.7 3.8-1.9l.9-1.2v1.5c0 1.5.6 2.8 2 3 0 0 1.7.1 4-1.6 2.1-1.7 3.3-3.1 3.3-3.1l.2 1.7s-1.8 2.8-3.8 4c-1 .6-2.7 1.3-4 1-1.4-.2-2.4-1.3-3-2.6a6.7 6.7 0 0 1-3.3 1 6.5 6.5 0 0 1-6.1-3.7 7 7 0 0 1-10.4-.3 7 7 0 0 1-4.6 1.8 6.9 6.9 0 0 1-5.7-3 6.9 6.9 0 0 1-5.7 3 7 7 0 0 1-4.7-1.8 7 7 0 0 1-10.4.3 6.5 6.5 0 0 1-6 3.7 6.7 6.7 0 0 1-3.4-1c-.6 1.3-1.5 2.4-3 2.7-1.2.2-2.9-.5-4-1.1-2-1.2-3.8-4-3.8-4l.2-1.7s1.2 1.4 3.4 3.1c2.2 1.8 3.9 1.6 3.9 1.6 1.4-.2 2-1.5 2-3v-1.5l1 1.2a4.6 4.6 0 0 0 3.7 2c2.5 0 4.5-2 4.5-4.3a4 4 0 0 0-.4-2l.8-1.9 1.5 1.5a4.4 4.4 0 0 0 0 .6c0 2.4 2 4.4 4.6 4.4 2.4 0 4.4-1.5 4.7-3.8 0 0 0-1.6.2-1.7.2 0 .6 1.7.7 1.6a4.7 4.7 0 0 0 4.5 3.1 4.6 4.6 0 0 0 4.5-6l1.2-.2");
    			add_location(path300, file$c, 1094, 1, 50271);
    			attr_dev(path301, "fill", "#fff");
    			attr_dev(path301, "stroke", "#000");
    			attr_dev(path301, "stroke-width", ".4");
    			attr_dev(path301, "d", "M238.6 197.7c.3-.8 0-1.6-.6-1.8-.5-.2-1.2.3-1.5 1.1-.3.8 0 1.6.6 1.8.5.2 1.2-.3 1.5-1.1m-20.5-4c0-.8-.3-1.6-1-1.6-.5-.1-1 .5-1.2 1.4-.1.8.3 1.5.9 1.6.6 0 1.2-.6 1.3-1.4m-23.9 0c0-.8.4-1.6 1-1.6.6-.1 1.1.5 1.2 1.4.1.8-.3 1.5-.9 1.6-.6 0-1.1-.6-1.2-1.4m-20.6 4c-.2-.8 0-1.6.6-1.8.6-.2 1.2.3 1.5 1.1.3.8 0 1.6-.5 1.8-.6.2-1.3-.3-1.6-1.1");
    			add_location(path301, file$c, 1100, 1, 51215);
    			attr_dev(path302, "fill", "#c8b100");
    			attr_dev(path302, "stroke", "#000");
    			attr_dev(path302, "stroke-width", ".4");
    			attr_dev(path302, "d", "M182.7 184a5.1 5.1 0 0 1 2.2 2.9s0-.3.6-.6 1-.3 1-.3l-.1 1.3-.3 2.2a7.4 7.4 0 0 1-.7 1.6 1.9 1.9 0 0 0-1.5-.4 1.8 1.8 0 0 0-1.2.9s-.7-.6-1.2-1.3l-1.1-2-.7-1.1s.5-.2 1.1 0c.6 0 .8.2.8.2a4.9 4.9 0 0 1 1-3.4m.4 9.8a1.8 1.8 0 0 1-.6-1c0-.5 0-.9.3-1.2 0 0-.9-.5-1.8-.7-.7-.2-2-.2-2.3-.2h-1l.2.5c.2.5.5.7.5.7a5 5 0 0 0-3 2 5.3 5.3 0 0 0 3.5 1l-.2.8v.6l1-.4c.3-.1 1.5-.5 2-1 .8-.4 1.5-1.1 1.5-1.1m2.7-.5a1.6 1.6 0 0 0 .2-1.1 1.7 1.7 0 0 0-.6-1l1.4-1.3a10 10 0 0 1 2-.9l1.1-.4v.6a5.7 5.7 0 0 1-.2.8 5 5 0 0 1 3.4 1 5 5 0 0 1-2.9 2 6.4 6.4 0 0 0 .7 1.2h-1c-.4 0-1.6 0-2.3-.2a11 11 0 0 1-1.8-.7");
    			add_location(path302, file$c, 1106, 1, 51616);
    			attr_dev(path303, "fill", "#ad1519");
    			attr_dev(path303, "stroke", "#000");
    			attr_dev(path303, "stroke-width", ".4");
    			attr_dev(path303, "d", "M182.2 192.4c0-1 1-2 2-2s2.2 1 2.2 2c0 1.1-1 2-2.1 2a2 2 0 0 1-2.1-2");
    			add_location(path303, file$c, 1112, 1, 52271);
    			attr_dev(path304, "fill", "#c8b100");
    			attr_dev(path304, "stroke", "#000");
    			attr_dev(path304, "stroke-width", ".4");
    			attr_dev(path304, "d", "M206.1 180.8a5.7 5.7 0 0 1 1.9 3.7s.2-.3.9-.5c.7-.3 1.2-.2 1.2-.2l-.5 1.4-.8 2.4a8.2 8.2 0 0 1-1 1.7 2.1 2.1 0 0 0-1.7-.7c-.6 0-1.2.3-1.6.7 0 0-.6-.7-1-1.7l-.8-2.4-.5-1.4 1.2.2c.7.2.9.5.9.5 0-1.4.8-2.8 1.8-3.7");
    			add_location(path304, file$c, 1118, 1, 52410);
    			attr_dev(path305, "fill", "#c8b100");
    			attr_dev(path305, "stroke", "#000");
    			attr_dev(path305, "stroke-width", ".4");
    			attr_dev(path305, "d", "M204.6 191.8a2 2 0 0 1-.5-1.2c0-.5.1-1 .4-1.3 0 0-.8-.7-1.8-1-.7-.4-2-.7-2.5-.7l-1.2-.2.2.6.4.9a5.9 5.9 0 0 0-3.7 1.7c1 .9 2.3 1.6 3.7 1.6l-.4 1-.2.6 1.2-.2c.4-.1 1.8-.4 2.5-.7 1-.4 1.9-1 1.9-1m3 0a1.9 1.9 0 0 0 .1-2.6s.9-.7 1.8-1a8 8 0 0 1 2.5-.7l1.2-.3-.1.7-.4.9c1.4 0 2.7.8 3.6 1.7a5.9 5.9 0 0 1-3.6 1.6 6.9 6.9 0 0 0 .5 1.6l-1.2-.2-2.5-.7c-1-.4-1.8-1-1.8-1m22-8a5.2 5.2 0 0 0-2.2 3l-.7-.6c-.6-.3-1-.3-1-.3l.2 1.3c0 .3 0 1.3.3 2.2.2 1 .6 1.6.6 1.6a2 2 0 0 1 1.5-.4c.6.1 1 .5 1.3.9l1.1-1.3c.6-.8 1-1.7 1.1-2l.7-1.1s-.4-.2-1 0c-.7 0-1 .2-1 .2a4.9 4.9 0 0 0-1-3.4m-.3 9.8c.3-.3.5-.6.6-1a1.6 1.6 0 0 0-.2-1.2s.8-.5 1.7-.7c.7-.2 2-.2 2.3-.2h1.1l-.3.5a6.2 6.2 0 0 1-.4.7 5 5 0 0 1 2.9 2 5.3 5.3 0 0 1-3.5 1l.2.8v.6l-1-.4c-.3-.1-1.4-.5-2-1-.8-.4-1.4-1.1-1.4-1.1m-2.8-.5a1.7 1.7 0 0 1-.2-1.1c0-.5.3-.8.6-1 0 0-.6-.8-1.4-1.3-.6-.4-1.7-.8-2-.9a171.4 171.4 0 0 1-1-.4v.6c0 .5.2.8.2.8a5.2 5.2 0 0 0-3.5 1c.7.9 1.7 1.7 3 2 0 0-.3.2-.5.7l-.3.5h1c.4 0 1.7 0 2.3-.2a11.1 11.1 0 0 0 1.8-.7");
    			add_location(path305, file$c, 1124, 1, 52690);
    			attr_dev(path306, "fill", "#ad1519");
    			attr_dev(path306, "stroke", "#000");
    			attr_dev(path306, "stroke-width", ".4");
    			attr_dev(path306, "d", "M226 192.4c0-1 1-2 2-2s2.1 1 2.1 2a2 2 0 0 1-2 2 2 2 0 0 1-2.1-2m23.2 4.4c-.4-.5-1.4-.4-2.2.2-.8.7-1 1.6-.5 2.2.5.5 1.5.4 2.3-.3.7-.6 1-1.6.5-2");
    			add_location(path306, file$c, 1130, 1, 53736);
    			attr_dev(path307, "fill", "#c8b100");
    			attr_dev(path307, "stroke", "#000");
    			attr_dev(path307, "stroke-width", ".4");
    			attr_dev(path307, "d", "m246.3 198 .7-1c.7-.6 1.8-.7 2.3-.2l.1.2s1-2 2.3-2.6c1.3-.7 3.4-.5 3.4-.5a2.8 2.8 0 0 0-2.9-2.8 3 3 0 0 0-2.4 1l-.2-1s-1.3.3-1.9 1.8c-.6 1.5 0 3.6 0 3.6s-.3-.9-.7-1.5a8 8 0 0 0-2.4-1.6l-1.3-.7-.1.5a5 5 0 0 0 0 .8 7.9 7.9 0 0 0-3.7.5 4.7 4.7 0 0 0 2.5 2.2l-.8.7a4 4 0 0 0-.4.5l1.3.2 2.5.2a14.5 14.5 0 0 0 1.7-.2m-80.3 0c0-.4-.3-.7-.7-1-.7-.7-1.7-.8-2.2-.3l-.2.3s-1-2-2.3-2.7c-1.2-.7-3.3-.5-3.3-.5a2.8 2.8 0 0 1 2.8-2.8c1 0 1.9.4 2.4 1l.2-1s1.3.3 2 1.8c.5 1.5-.1 3.6-.1 3.6s.3-.9.8-1.5a8 8 0 0 1 2.4-1.6l1.3-.7v1.3a7.9 7.9 0 0 1 3.7.5 4.7 4.7 0 0 1-2.5 2.2l.8.7.4.5-1.2.2-2.6.2a14.7 14.7 0 0 1-1.7-.2");
    			add_location(path307, file$c, 1136, 1, 53950);
    			attr_dev(path308, "fill", "#ad1519");
    			attr_dev(path308, "stroke", "#000");
    			attr_dev(path308, "stroke-width", ".4");
    			attr_dev(path308, "d", "M163 196.8c.6-.5 1.6-.4 2.4.3.7.6 1 1.5.4 2-.5.6-1.5.5-2.2-.2-.8-.6-1-1.6-.5-2m41-6.3c0-1.1.9-2 2-2s2.1.9 2.1 2c0 1-1 2-2 2a2 2 0 0 1-2.1-2");
    			add_location(path308, file$c, 1142, 1, 54619);
    			attr_dev(path309, "fill", "#005bbf");
    			attr_dev(path309, "stroke", "#000");
    			attr_dev(path309, "stroke-width", ".3");
    			attr_dev(path309, "d", "M201.8 160.6c0-2.2 1.9-4 4.3-4s4.2 1.8 4.2 4-1.9 4-4.3 4a4.1 4.1 0 0 1-4.2-4");
    			add_location(path309, file$c, 1148, 1, 54829);
    			attr_dev(path310, "fill", "#c8b100");
    			attr_dev(path310, "stroke", "#000");
    			attr_dev(path310, "stroke-width", ".3");
    			attr_dev(path310, "d", "M205 149.3v2.2h-2.4v2.2h2.3v6.3H202l-.2.6c0 .6.1 1.1.3 1.6h7.9c.2-.5.3-1 .3-1.6l-.2-.6h-2.8v-6.3h2.3v-2.2h-2.3v-2.2h-2.4z");
    			add_location(path310, file$c, 1154, 1, 54976);
    			attr_dev(path311, "fill", "#ccc");
    			attr_dev(path311, "d", "M206.5 330.6a82 82 0 0 1-35.5-8.2 22.7 22.7 0 0 1-12.8-20.4v-32h96.4v32a22.7 22.7 0 0 1-12.8 20.4 81 81 0 0 1-35.3 8.2");
    			add_location(path311, file$c, 1160, 1, 55168);
    			attr_dev(path312, "fill", "none");
    			attr_dev(path312, "stroke", "#000");
    			attr_dev(path312, "stroke-width", ".5");
    			attr_dev(path312, "d", "M206.5 330.6a82 82 0 0 1-35.5-8.2 22.7 22.7 0 0 1-12.8-20.4v-32h96.4v32a22.7 22.7 0 0 1-12.8 20.4 81 81 0 0 1-35.3 8.2z");
    			add_location(path312, file$c, 1164, 1, 55318);
    			attr_dev(path313, "fill", "#ccc");
    			attr_dev(path313, "d", "M206.3 270h48.3v-53.5h-48.3V270z");
    			add_location(path313, file$c, 1170, 1, 55505);
    			attr_dev(path314, "fill", "none");
    			attr_dev(path314, "stroke", "#000");
    			attr_dev(path314, "stroke-width", ".5");
    			attr_dev(path314, "d", "M206.3 270h48.3v-53.5h-48.3V270z");
    			add_location(path314, file$c, 1171, 1, 55564);
    			attr_dev(path315, "fill", "#ad1519");
    			attr_dev(path315, "d", "M206.3 302c0 12.6-10.7 22.9-24 22.9s-24.2-10.3-24.2-23v-32h48.2v32");
    			add_location(path315, file$c, 1172, 1, 55655);
    			attr_dev(path316, "fill", "#c8b100");
    			attr_dev(path316, "stroke", "#000");
    			attr_dev(path316, "stroke-width", ".5");
    			attr_dev(path316, "d", "M168.6 320.9c1.5.8 3.6 2 5.8 2.6l-.1-54.7h-5.7v52z");
    			add_location(path316, file$c, 1173, 1, 55751);
    			attr_dev(path317, "fill", "#c8b100");
    			attr_dev(path317, "stroke", "#000");
    			attr_dev(path317, "stroke-linejoin", "round");
    			attr_dev(path317, "stroke-width", ".5");
    			attr_dev(path317, "d", "M158 301.6a24.4 24.4 0 0 0 5.5 15v-47.5h-5.4v32.5z");
    			add_location(path317, file$c, 1179, 1, 55872);
    			attr_dev(path318, "fill", "#c7b500");
    			attr_dev(path318, "stroke", "#000");
    			attr_dev(path318, "stroke-width", ".5");
    			attr_dev(path318, "d", "M179.4 324.7a26.6 26.6 0 0 0 5.6 0v-55.9h-5.6v56z");
    			add_location(path318, file$c, 1186, 1, 56019);
    			attr_dev(path319, "fill", "#c8b100");
    			attr_dev(path319, "stroke", "#000");
    			attr_dev(path319, "stroke-width", ".5");
    			attr_dev(path319, "d", "M190 323.5a19 19 0 0 0 5.8-2.5v-52.2H190l-.1 54.7z");
    			add_location(path319, file$c, 1192, 1, 56139);
    			attr_dev(path320, "fill", "#ad1519");
    			attr_dev(path320, "d", "M158.1 270h48.2v-53.5H158V270z");
    			add_location(path320, file$c, 1198, 1, 56260);
    			attr_dev(path321, "fill", "none");
    			attr_dev(path321, "stroke", "#000");
    			attr_dev(path321, "stroke-width", ".5");
    			attr_dev(path321, "d", "M158.1 270h48.2v-53.5H158V270z");
    			add_location(path321, file$c, 1199, 1, 56320);
    			attr_dev(path322, "fill", "#c8b100");
    			attr_dev(path322, "stroke", "#000");
    			attr_dev(path322, "stroke-width", ".5");
    			attr_dev(path322, "d", "M201 316c2.4-2 4.6-6.8 5.4-12.2l.1-35H201l.1 47.3z");
    			add_location(path322, file$c, 1200, 1, 56409);
    			attr_dev(path323, "fill", "none");
    			attr_dev(path323, "stroke", "#000");
    			attr_dev(path323, "stroke-width", ".5");
    			attr_dev(path323, "d", "M206.3 302c0 12.6-10.7 22.9-24 22.9s-24.2-10.3-24.2-23v-32h48.2v32");
    			add_location(path323, file$c, 1206, 1, 56530);
    			attr_dev(path324, "fill", "#ad1519");
    			attr_dev(path324, "d", "M254.6 270v32c0 12.6-10.8 22.9-24.1 22.9s-24.2-10.3-24.2-23v-32h48.3");
    			add_location(path324, file$c, 1212, 1, 56664);
    			attr_dev(path325, "fill", "none");
    			attr_dev(path325, "stroke", "#000");
    			attr_dev(path325, "stroke-width", ".5");
    			attr_dev(path325, "d", "M254.6 270v32c0 12.6-10.8 22.9-24.1 22.9s-24.2-10.3-24.2-23v-32h48.3");
    			add_location(path325, file$c, 1213, 1, 56762);
    			attr_dev(path326, "fill", "#c8b100");
    			attr_dev(path326, "d", "m215.1 294.1.1.5c0 .6-.5 1-1.1 1a1 1 0 0 1-1.1-1v-.5h-1.5a2.5 2.5 0 0 0 1.8 2.9v3.9h1.6V297a2.6 2.6 0 0 0 1.7-1.6h4.4v-1.2h-6m21.8 0v1.2h-4a2.5 2.5 0 0 1-.3.6l4.6 5.2-1.2 1-4.6-5.3-.2.1v8.7h-1.6V297h-.2l-4.8 5.2-1.2-1 4.7-5.3a2.1 2.1 0 0 1-.2-.4h-4V294h13zm2.6 0v1.2h4.4c.3.8.9 1.4 1.7 1.6v3.9h1.6V297a2.5 2.5 0 0 0 1.8-2.4 2 2 0 0 0 0-.5h-1.6l.1.5c0 .6-.5 1-1 1-.7 0-1.2-.4-1.2-1a1 1 0 0 1 .1-.5h-5.9m-6.7 22.1a15.6 15.6 0 0 0 3.7-1l.8 1.4a17.6 17.6 0 0 1-4.3 1.2 2.6 2.6 0 0 1-2.6 2 2.6 2.6 0 0 1-2.5-2 17.5 17.5 0 0 1-4.6-1.2l.8-1.4c1.3.5 2.6.9 4 1a2.5 2.5 0 0 1 1.5-1.3v-6.7h1.6v6.7c.7.2 1.3.7 1.6 1.4zm-11-2.2-.8 1.4a16.6 16.6 0 0 1-3.6-3.1c-.9.2-1.8 0-2.5-.5a2.4 2.4 0 0 1-.3-3.5l.1-.1a15.3 15.3 0 0 1-1.3-4.8h1.7a13.1 13.1 0 0 0 1 4c.5 0 1 0 1.4.2l4.1-4.5 1.3 1-4.1 4.5c.5.9.5 2-.1 2.8a15.2 15.2 0 0 0 3.1 2.6zm-6-4.8c.3-.4 1-.5 1.5 0s.5 1 .1 1.4a1.2 1.2 0 0 1-1.6.1 1 1 0 0 1 0-1.5zm-2.2-4.5-1.6-.3-.3-4.3 1.7-.6v2.5c0 1 0 1.8.2 2.7zm1.4-5.3 1.7.4v2.2c0-.8.3 2.1.3 2.1l-1.7.6a14 14 0 0 1-.3-2.7v-2.6zm5.6 13.7a15.7 15.7 0 0 0 4.8 2.6l.4-1.6a13.7 13.7 0 0 1-4-2l-1.2 1m-.8 1.4a17.4 17.4 0 0 0 4.8 2.6l-1.2 1.1a18.7 18.7 0 0 1-4-2l.4-1.7m2.2-9.4 1.6.7 3-3.3-1-1.4-3.6 4m-1.3-1-1-1.4 3-3.3 1.6.7-3.6 4m18.1 9.9.8 1.4a16.7 16.7 0 0 0 3.6-3.1c.9.2 1.8 0 2.5-.5a2.4 2.4 0 0 0 .3-3.5l-.1-.1a15 15 0 0 0 1.3-4.8h-1.7a13.3 13.3 0 0 1-1 4 3 3 0 0 0-1.4.2l-4.1-4.5-1.3 1 4.1 4.5a2.4 2.4 0 0 0 .1 2.8 15 15 0 0 1-3.1 2.6zm6-4.8a1.2 1.2 0 0 0-1.5 0 1 1 0 0 0-.1 1.4 1.2 1.2 0 0 0 1.6.1 1 1 0 0 0 0-1.5zm2.2-4.5 1.6-.3.3-4.3-1.7-.6v2.5c0 1 0 1.9-.2 2.8zm-1.4-5.3-1.7.4v2.2c0-.8-.3 2.1-.3 2.1l1.7.6.3-2.7v-2.6m-5.6 13.7a15.7 15.7 0 0 1-4.8 2.6l-.4-1.6a13.7 13.7 0 0 0 4-2l1.2 1m.8 1.4a17.4 17.4 0 0 1-4.8 2.6l1.2 1.1a18.6 18.6 0 0 0 4-2l-.4-1.7m-2.2-9.4-1.6.7-2.9-3.3 1-1.4 3.5 4m1.3-1 1-1.4-3-3.3-1.6.7 3.6 4m-20.1-8.7.5 1.6h4.5l.5-1.6h-5.5m21.1 0-.5 1.6h-4.5l-.5-1.6h5.5m-11.6 21.9c0-.6.5-1 1.1-1a1 1 0 0 1 1.1 1c0 .6-.5 1-1 1a1.1 1.1 0 0 1-1.2-1zm1.9-7.8 1.7-.4v-4.3l-1.7-.5v5.2m-1.6 0-1.7-.4v-4.3l1.7-.5v5.2");
    			add_location(path326, file$c, 1219, 1, 56898);
    			attr_dev(path327, "fill", "#c8b100");
    			attr_dev(path327, "d", "M211.5 294.2c.2-1 1-1.6 1.8-2V287h1.6v5.3c.8.3 1.5.9 1.7 1.6h4.4v.3h-6a1.2 1.2 0 0 0-1-.6c-.4 0-.7.3-1 .6h-1.5m12.2 0v-.3h4.1a2.4 2.4 0 0 1 .2-.3l-5-5.7 1.2-1 5 5.6.2-.1V285h1.6v7.3h.3l4.9-5.5 1.2 1-4.9 5.5.3.6h4v.3h-13zm21.6 0a1.1 1.1 0 0 1 1-.6c.5 0 .8.3 1 .6h1.6c-.2-1-.9-1.6-1.8-2V287h-1.6v5.3c-.8.3-1.4.8-1.7 1.6h-4.4v.3h6m-30.2-15 6 6.8 1.3-1-6.1-6.7.3-.6h4.4V276h-4.4a2.6 2.6 0 0 0-2.5-1.7 2.6 2.6 0 0 0-2.7 2.5 2.5 2.5 0 0 0 1.8 2.4v5.2h1.6v-5.2h.3zm32 0v5.3h-1.7v-5.2a2.5 2.5 0 0 1-.4-.2l-6 6.8-1.3-1 6.2-6.9-.1-.3h-4.5V276h4.5a2.6 2.6 0 0 1 2.4-1.7 2.6 2.6 0 0 1 2.7 2.5 2.5 2.5 0 0 1-1.9 2.4zm-16.1 0v3.3h-1.7v-3.2a2.6 2.6 0 0 1-1.7-1.6h-4V276h4a2.6 2.6 0 0 1 2.5-1.7c1.2 0 2.2.7 2.5 1.7h4v1.6h-4a2.5 2.5 0 0 1-1.6 1.6zm-17.8 4-1.7.4v4.3l1.7.5v-5.2m1.6 0 1.7.4v4.3l-1.7.5v-5.2m30.6 0-1.7.4v4.3l1.7.5v-5.2m1.6 0 1.7.4v4.3l-1.7.5v-5.2m-25.5.8 1.6-.7 2.9 3.3-1 1.4-3.5-4m-1.3 1-1 1.4 3 3.3 1.6-.7-3.6-4m18.5-1.1-1.6-.7-3 3.3 1 1.4 3.6-4m1.2 1 1 1.4-3 3.3-1.5-.7 3.5-4m-20.3 9 .5-1.6h4.5l.5 1.6h-5.5m-6.7-17c0-.6.5-1 1.2-1a1 1 0 0 1 1 1c0 .6-.4 1-1 1a1.1 1.1 0 0 1-1.2-1zm12.1.8-.5 1.6h-4.5l-.5-1.6h5.5m0-1.6-.5-1.6h-4.5l-.5 1.6h5.5m15.7 17.8-.5-1.6h-4.5l-.5 1.6h5.5m4.4-17c0-.6.5-1 1.1-1a1 1 0 0 1 1.1 1c0 .6-.5 1-1 1a1.1 1.1 0 0 1-1.2-1zm-16.1 0c0-.6.5-1 1.1-1a1 1 0 0 1 1.1 1c0 .6-.5 1-1.1 1a1.1 1.1 0 0 1-1.1-1zm6.2.8.5 1.6h4.6l.5-1.6h-5.6m0-1.6.5-1.6h4.6l.5 1.6h-5.6m-5.9 5-1.7.5v4.3l1.7.5V281m1.7 0 1.6.5v4.3l-1.6.5V281");
    			add_location(path327, file$c, 1223, 1, 58937);
    			attr_dev(path328, "fill", "none");
    			attr_dev(path328, "stroke", "#c8b100");
    			attr_dev(path328, "stroke-width", ".3");
    			attr_dev(path328, "d", "M232.7 316.3a15.6 15.6 0 0 0 3.7-1.1l.8 1.4a17.6 17.6 0 0 1-4.3 1.2 2.6 2.6 0 0 1-2.6 2 2.6 2.6 0 0 1-2.5-2 17.5 17.5 0 0 1-4.6-1.2l.8-1.4c1.3.5 2.6.9 4 1a2.5 2.5 0 0 1 1.5-1.3v-6.7h1.6v6.7c.7.2 1.3.7 1.6 1.4zm-4.7-20.4a2.3 2.3 0 0 1-.2-.5h-4V294h4a2.6 2.6 0 0 1 .2-.4l-5-5.6 1.2-1 5 5.5a2.2 2.2 0 0 1 .2 0V285h1.7v7.3h.2l4.9-5.5 1.2 1-4.9 5.5.3.6h4v1.5h-4c0 .2-.2.4-.3.5l4.7 5.3-1.3 1-4.6-5.3-.2.1v8.7h-1.6V297l-.2-.1-4.8 5.3-1.2-1 4.7-5.3m-12.8-16.7 6 6.8 1.3-1-6.1-6.7.3-.6h4.4V276h-4.4a2.6 2.6 0 0 0-2.5-1.7 2.6 2.6 0 0 0-2.6 2.5 2.5 2.5 0 0 0 1.7 2.4v5.2h1.6v-5.2h.3zm6.5 34.8-.8 1.4a16.6 16.6 0 0 1-3.6-3.1c-.9.2-1.8 0-2.5-.5a2.4 2.4 0 0 1-.3-3.5l.1-.1a15.3 15.3 0 0 1-1.2-4.8h1.6a13.1 13.1 0 0 0 1 4c.5 0 1 0 1.4.2l4.1-4.5 1.3 1-4.1 4.5c.6.9.5 2-.1 2.8a15.2 15.2 0 0 0 3.1 2.6zm-8.4-13.1V297a2.5 2.5 0 0 1-1.8-2.4c0-1 .8-2 1.8-2.4V287h1.6v5.3c.8.2 1.5.8 1.7 1.6h4.4v1.5h-4.4a2.6 2.6 0 0 1-1.6 1.6v3.9h-1.7m2.3 8.3c.4-.4 1.1-.5 1.6 0s.5 1 .1 1.4a1.2 1.2 0 0 1-1.6.1 1 1 0 0 1 0-1.5zm-2-4.5-1.7-.3-.3-4.3 1.7-.6v2.5c0 1 0 1.8.3 2.7zm1.4-5.3 1.6.4v2.2c0-.8.3 2.1.3 2.1l-1.7.6-.3-2.7v-2.6zm5.5 13.7a15.7 15.7 0 0 0 4.8 2.6l.4-1.6a13.7 13.7 0 0 1-4-2l-1.2 1m-.8 1.4a17.4 17.4 0 0 0 4.8 2.6l-1.2 1.1a18.7 18.7 0 0 1-4-2l.4-1.7");
    			add_location(path328, file$c, 1227, 1, 60404);
    			attr_dev(path329, "fill", "none");
    			attr_dev(path329, "stroke", "#c8b100");
    			attr_dev(path329, "stroke-width", ".3");
    			attr_dev(path329, "d", "m221.9 305.1 1.6.7 3-3.3-1-1.4-3.6 4m-1.3-1-1-1.4 3-3.3 1.6.7-3.6 4m-7.6-9.5c0-.6.5-1 1-1 .7 0 1.2.5 1.2 1 0 .6-.5 1.1-1.1 1.1a1 1 0 0 1-1.1-1zm25.7 19.4.8 1.4a16.7 16.7 0 0 0 3.6-3.1c.9.2 1.8 0 2.6-.5a2.4 2.4 0 0 0 .2-3.5l-.1-.1a15 15 0 0 0 1.3-4.8h-1.7a13.3 13.3 0 0 1-1 4 3 3 0 0 0-1.4.2l-4.1-4.5-1.3 1 4.1 4.5a2.4 2.4 0 0 0 .1 2.8 15 15 0 0 1-3 2.6zm8.4-13.1V297a2.5 2.5 0 0 0 1.8-2.4c0-1-.7-2-1.8-2.4V287h-1.6v5.3c-.8.2-1.4.8-1.7 1.6h-4.4v1.5h4.4c.3.8.9 1.3 1.7 1.6v3.9h1.6zm-2.3 8.3a1.2 1.2 0 0 0-1.6 0 1 1 0 0 0-.1 1.4 1.2 1.2 0 0 0 1.6.1 1 1 0 0 0 0-1.5zm2-4.5 1.7-.3.3-4.3-1.7-.6v2.5c0 1 0 1.8-.2 2.7zm-1.3-5.3-1.7.4v2.2c0-.8-.3 2.1-.3 2.1l1.7.6.3-2.7v-2.6m1.6-20.1v5.2h-1.6v-5.2a2.3 2.3 0 0 1-.4-.2l-6 6.8-1.2-1 6-7v-.2h-4.5V276h4.4a2.6 2.6 0 0 1 2.5-1.7 2.6 2.6 0 0 1 2.6 2.5 2.5 2.5 0 0 1-1.8 2.4zm-16 0v3.2h-1.7v-3.2a2.6 2.6 0 0 1-1.7-1.6h-4V276h4c.4-1 1.3-1.7 2.5-1.7s2.2.7 2.5 1.7h4v1.6h-4a2.5 2.5 0 0 1-1.6 1.6zm8.8 33.8a15.7 15.7 0 0 1-4.8 2.6l-.4-1.6a13.7 13.7 0 0 0 4-2l1.2 1m.8 1.4a17.4 17.4 0 0 1-4.8 2.6l1.2 1.1a18.7 18.7 0 0 0 4-2l-.4-1.7m-27.4-31.4-1.7.5v4.3l1.7.5v-5.2m1.7 0 1.6.4v4.3l-1.6.5V283m30.5 0-1.7.5v4.3l1.7.5V283");
    			add_location(path329, file$c, 1233, 1, 61702);
    			attr_dev(path330, "fill", "none");
    			attr_dev(path330, "stroke", "#c8b100");
    			attr_dev(path330, "stroke-width", ".3");
    			attr_dev(path330, "d", "m247.1 283.1 1.7.5v4.3l-1.7.5V283m-8.6 22-1.6.7-2.9-3.3 1-1.4 3.5 4m1.3-1 1-1.4-3-3.3-1.6.7 3.6 4m-18.2-20 1.6-.7 3 3.3-1 1.4-3.6-4m-1.3 1-1 1.4 3 3.3 1.6-.7-3.6-4m18.5-1.1-1.6-.7-3 3.3 1 1.4 3.6-4m1.2 1 1 1.4-3 3.2-1.5-.6 3.5-4m-20.3 9 .5-1.6h4.5l.5 1.6h-5.5m0 1.5.5 1.6h4.5l.5-1.6h-5.5M213 277c0-.6.5-1 1.2-1 .6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1-1.2-1zm12.1.8-.5 1.6h-4.5l-.5-1.6h5.5m0-1.6-.5-1.6h-4.5l-.5 1.6h5.5m20.1 18.5c0-.5.5-1 1.1-1 .6 0 1.1.5 1.1 1 0 .6-.5 1.1-1 1.1a1 1 0 0 1-1.2-1zm-4.4-.7-.5-1.6h-4.5l-.5 1.6h5.5m0 1.5-.5 1.6h-4.5l-.5-1.6h5.5m-11.6 21.9c0-.6.5-1 1.1-1 .6 0 1.1.4 1.1 1s-.5 1-1 1a1.1 1.1 0 0 1-1.2-1zm1.9-7.8 1.7-.4v-4.3l-1.7-.5v5.2m-1.6 0-1.7-.4v-4.3l1.7-.5v5.2m15.7-32.6c0-.6.5-1 1.1-1a1 1 0 0 1 1.1 1c0 .6-.5 1-1 1a1.1 1.1 0 0 1-1.2-1zm-16.1 0c0-.6.5-1 1.1-1a1 1 0 0 1 1.1 1c0 .6-.5 1-1 1a1.1 1.1 0 0 1-1.2-1zm6.2.8.5 1.6h4.6l.5-1.6h-5.5m0-1.6.4-1.6h4.6l.5 1.6h-5.5m-6 5-1.6.5v4.3l1.6.5V281m1.7 0 1.6.5v4.3l-1.6.5V281");
    			add_location(path330, file$c, 1239, 1, 62920);
    			attr_dev(path331, "fill", "#058e6e");
    			attr_dev(path331, "d", "M227.7 294.7a2.6 2.6 0 0 1 2.6-2.5 2.6 2.6 0 0 1 2.6 2.5 2.6 2.6 0 0 1-2.6 2.4c-1.4 0-2.6-1-2.6-2.4");
    			add_location(path331, file$c, 1245, 1, 63936);
    			attr_dev(path332, "fill", "#db4446");
    			attr_dev(path332, "d", "M230.9 229.7v-.6l.1-.3-2.3-.1a5.9 5.9 0 0 1-2.3-1.2c-.8-.7-1.1-1-1.6-1.2-1.3-.2-2.3.4-2.3.4s1 .4 1.7 1.3 1.5 1.3 1.8 1.4c.6.2 2.6 0 3.1.1l1.8.2");
    			add_location(path332, file$c, 1249, 1, 64070);
    			attr_dev(path333, "fill", "none");
    			attr_dev(path333, "stroke", "#000");
    			attr_dev(path333, "stroke-width", ".4");
    			attr_dev(path333, "d", "M230.9 229.7v-.6l.1-.3-2.3-.1a5.9 5.9 0 0 1-2.3-1.2c-.8-.7-1.1-1-1.6-1.2-1.3-.2-2.3.4-2.3.4s1 .4 1.7 1.3 1.5 1.3 1.8 1.4c.6.2 2.6 0 3.1.1l1.8.2z");
    			add_location(path333, file$c, 1253, 1, 64248);
    			attr_dev(path334, "fill", "#ed72aa");
    			attr_dev(path334, "stroke", "#000");
    			attr_dev(path334, "stroke-width", ".4");
    			attr_dev(path334, "d", "M238.1 227.5v1.4c.2.6-.1 1.2 0 1.5 0 .4.1.6.3.9l.2.9-.7-.5-.6-.4v1c.1.2.3.8.6 1.1l1 1.3c.2.5.1 1.4.1 1.4s-.4-.7-.8-.8l-1.2-.7s.7.8.7 1.5c0 .8-.3 1.6-.3 1.6s-.3-.7-.8-1.1l-1-.9s.4 1.2.4 2v2.3l-.9-1-1-.7c0-.2.5.6.6 1.1 0 .5.3 2.3 1.8 4.5 1 1.3 2.3 3.6 5.3 2.9 3-.8 1.9-4.8 1.3-6.7a16.8 16.8 0 0 1-1-4.6c0-.8.6-2.9.5-3.3a8 8 0 0 1 .2-3.1c.4-1.3.7-1.8.9-2.3.2-.6.4-.9.4-1.3l.1-1.3.7 1.3.1 1.5s.1-1 1-1.6c.8-.6 1.8-1.1 2-1.4.3-.3.3-.5.3-.5s0 1.8-.6 2.6l-1.7 2s.7-.3 1.2-.3h.9s-.6.4-1.4 1.6c-.8 1-.5 1.2-1 2.1-.6 1-1 1-1.7 1.5-1 .8-.5 4.2-.4 4.7.2.5 2 4.5 2 5.5s.2 3.2-1.5 4.6c-1.1 1-3 1-3.4 1.2-.4.3-1.2 1.1-1.2 2.8 0 1.7.6 2 1 2.4.6.5 1.2.2 1.3.6.2.3.2.5.5.7.2.2.3.4.2.8 0 .3-.8 1.1-1.1 1.7l-.8 2.4c0 .2-.1 1 .1 1.3 0 0 .9 1 .3 1.2-.4.2-.8-.2-1-.2l-.9.5c-.3-.1-.3-.3-.4-.8l-.1-.7c-.2 0-.3.2-.4.5 0 .2 0 .8-.3.8-.2 0-.5-.4-.8-.5-.2 0-.8-.2-.8-.4 0-.3.4-.9.7-1 .4 0 .8-.3.5-.5s-.5-.2-.7 0-.8 0-.7-.2v-.8c0-.2-.4-.5.1-.8.6-.3.8.2 1.4.1.6 0 .8-.3 1-.6.2-.3.2-1-.2-1.4-.4-.5-.7-.5-.9-.8l-.3-.9v2.2l-.7-.8c-.3-.3-.6-1.3-.6-1.3v1.3c0 .4.3.7.2.8-.1.1-.8-.7-1-.8a3.7 3.7 0 0 1-1-1l-.4-1.4a4.2 4.2 0 0 1 0-1.5l.4-1h-1.4c-.7 0-1.2-.3-1.5.2-.3.5-.2 1.5.2 2.8.3 1.2.5 1.9.4 2.1a3 3 0 0 1-.7.8h-.9a2.5 2.5 0 0 0-1.2-.3h-1.3l-1.1-.3c-.3.1-.8.3-.6.7.2.6-.2.7-.5.7l-.9-.2c-.4-.1-.9 0-.8-.4 0-.4.2-.4.4-.7.2-.3.2-.5 0-.5h-.6c-.2.2-.5.5-.8.4-.2-.1-.4-.4-.4-1s-.7-1.2 0-1.1c.5 0 1.3.4 1.4 0 .2-.3 0-.4-.2-.7s-.8-.4-.3-.7l.7-.5c.1-.2.4-.8.7-.6.6.2 0 .7.6 1.3.6.7 1 1 2 .8 1 0 1.3-.2 1.3-.5l-.1-1v-1s-.4.3-.5.6l-.4.8v-2a8 8 0 0 0-.2-.8l-.3.9-.1 1s-.7-.5-.5-1.5c.1-.7-.1-1.6.1-2 .2-.3.7-1.5 2-1.6h2.6l2-.3s-2.8-1.4-3.5-1.9a9.5 9.5 0 0 1-2-2l-.6-1.6s-.5 0-1 .3a5 5 0 0 0-1.2 1l-.7 1 .1-1.2v-.8s-.4 1.2-1 1.7l-1.4 1v-.8l.2-1s-.4.8-1.1 1c-.7 0-1.8 0-1.9.4 0 .5.2 1 0 1.4 0 .3-.4.5-.4.5l-.8-.4c-.4 0-.7.2-.7.2s-.3-.4-.2-.7c.1-.2.7-.6.5-.8l-.8.2c-.3.1-.8.3-.8-.2 0-.4.2-.7 0-1 0-.3 0-.5.2-.6l1.2-.1c0-.2-.2-.5-.8-.6-.6-.1-.8-.5-.5-.8.3-.2.3-.3.5-.6.1-.2.2-.7.7-.5.5.3.4.8 1 1a4 4 0 0 0 2-.2l1.5-1 1.5-1-1-.8c-.3-.3-.7-.9-1-1a8.3 8.3 0 0 0-1.8-.6 9 9 0 0 1-1.7-.5l.8-.3c.2-.2.6-.6.8-.6h.3-1.4c-.3-.1-1-.6-1.3-.6l-.8.1s.8-.4 1.4-.5l1-.1s-.9-.3-1.1-.6l-.6-1c-.2-.1-.3-.5-.6-.5l-1 .3c-.4 0-.6-.2-.6-.6l-.1-.5c-.2-.3-.6-.8-.2-1h1.4c0-.2-.5-.6-.8-.8-.4-.2-1-.5-.7-.8l.8-.5c.2-.3.3-1 .7-.7.4.2.8 1.2 1.1 1.1.3 0 .3-.8.3-1 0-.4 0-1 .2-.9.3 0 .5.4 1 .5.4 0 1-.1 1 .2 0 .3-.3.7-.6 1-.3.3-.4 1-.3 1.4.2.5.7 1.2 1.2 1.4.4.3 1.2.5 1.7.9.5.3 1.7 1.2 2.1 1.3l.8.4s.5-.2 1.1-.2c.7 0 2.1 0 2.6-.2.6-.2 1.3-.6 1-1-.1-.6-1.3-1-1.2-1.4 0-.4.5-.4 1.2-.4.8 0 1.8.1 2-1 .2-1 .2-1.5-.8-1.8-1-.2-1.8-.2-2-1-.2-.7-.4-.9-.2-1.1.3-.2.6-.3 1.4-.4.8 0 1.6 0 1.9-.2.2-.2.3-.7.6-.9.3-.2 1.4-.4 1.4-.4s1.4.7 2.7 1.7a15 15 0 0 1 2.2 2.1");
    			add_location(path334, file$c, 1259, 1, 64460);
    			attr_dev(path335, "d", "m228.1 226.8-.2-.6v-.3s.8 0 .7.3c0 .2-.2.2-.3.3l-.2.3");
    			add_location(path335, file$c, 1265, 1, 67201);
    			attr_dev(path336, "fill", "none");
    			attr_dev(path336, "stroke", "#000");
    			attr_dev(path336, "stroke-width", ".3");
    			attr_dev(path336, "d", "m228.1 226.8-.2-.6v-.3s.8 0 .7.3c0 .2-.2.2-.3.3l-.2.3z");
    			add_location(path336, file$c, 1266, 1, 67269);
    			attr_dev(path337, "d", "M232 225.4v-.4s.7 0 1 .3c.5.4.9 1 .9 1l-.8-.4h-.5l-.3-.1v-.3h-.3");
    			add_location(path337, file$c, 1272, 1, 67391);
    			attr_dev(path338, "fill", "none");
    			attr_dev(path338, "stroke", "#000");
    			attr_dev(path338, "stroke-width", ".1");
    			attr_dev(path338, "d", "M232 225.4v-.4s.7 0 1 .3c.5.4.9 1 .9 1l-.8-.4h-.5l-.3-.1v-.3h-.3z");
    			add_location(path338, file$c, 1273, 1, 67470);
    			attr_dev(path339, "fill", "none");
    			attr_dev(path339, "stroke", "#000");
    			attr_dev(path339, "stroke-width", ".3");
    			attr_dev(path339, "d", "m237.3 231.3-.4-.7a8 8 0 0 1-.3-.4");
    			add_location(path339, file$c, 1279, 1, 67603);
    			attr_dev(path340, "fill", "#db4446");
    			attr_dev(path340, "d", "M217.4 226.6s.5.4.8.4h.8s.2-.5.1-.8c-.2-1.2-1.2-1.4-1.2-1.4s.3.7.1 1a2 2 0 0 1-.6.8");
    			add_location(path340, file$c, 1280, 1, 67696);
    			attr_dev(path341, "fill", "none");
    			attr_dev(path341, "stroke", "#000");
    			attr_dev(path341, "stroke-width", ".4");
    			attr_dev(path341, "d", "M217.4 226.6s.5.4.8.4h.8s.2-.5.1-.8c-.2-1.2-1.2-1.4-1.2-1.4s.3.7.1 1a2 2 0 0 1-.6.8z");
    			add_location(path341, file$c, 1284, 1, 67814);
    			attr_dev(path342, "fill", "#db4446");
    			attr_dev(path342, "d", "M215.2 227.6s-.4-.7-1.3-.6c-.8 0-1.4.8-1.4.8h1.2c.3.3.4 1 .4 1l.7-.6a7.2 7.2 0 0 0 .4-.6");
    			add_location(path342, file$c, 1290, 1, 67966);
    			attr_dev(path343, "fill", "none");
    			attr_dev(path343, "stroke", "#000");
    			attr_dev(path343, "stroke-width", ".4");
    			attr_dev(path343, "d", "M215.2 227.6s-.4-.7-1.3-.6c-.8 0-1.4.8-1.4.8h1.2c.3.3.4 1 .4 1l.7-.6a7.2 7.2 0 0 0 .4-.6z");
    			add_location(path343, file$c, 1294, 1, 68089);
    			attr_dev(path344, "fill", "#db4446");
    			attr_dev(path344, "d", "M214.2 230.6s-.8.1-1.2.6c-.4.5-.3 1.3-.3 1.3s.4-.5.9-.5l1 .2-.1-.8-.3-.8");
    			add_location(path344, file$c, 1300, 1, 68246);
    			attr_dev(path345, "fill", "none");
    			attr_dev(path345, "stroke", "#000");
    			attr_dev(path345, "stroke-width", ".4");
    			attr_dev(path345, "d", "M214.2 230.6s-.8.1-1.2.6c-.4.5-.3 1.3-.3 1.3s.4-.5.9-.5l1 .2-.1-.8-.3-.8z");
    			add_location(path345, file$c, 1301, 1, 68348);
    			attr_dev(path346, "d", "m228.2 230.5.3-.5.3.5h-.7");
    			add_location(path346, file$c, 1307, 1, 68489);
    			attr_dev(path347, "fill", "none");
    			attr_dev(path347, "stroke", "#000");
    			attr_dev(path347, "stroke-width", ".3");
    			attr_dev(path347, "d", "m228.2 230.5.3-.5.3.5h-.7");
    			add_location(path347, file$c, 1308, 1, 68529);
    			attr_dev(path348, "d", "m229 230.5.3-.5.4.5h-.8");
    			add_location(path348, file$c, 1309, 1, 68613);
    			attr_dev(path349, "fill", "none");
    			attr_dev(path349, "stroke", "#000");
    			attr_dev(path349, "stroke-width", ".3");
    			attr_dev(path349, "d", "m229 230.5.3-.5.4.5h-.8");
    			add_location(path349, file$c, 1310, 1, 68651);
    			attr_dev(path350, "d", "m228.6 227.3.8.3-.7.4-.1-.6");
    			add_location(path350, file$c, 1311, 1, 68733);
    			attr_dev(path351, "fill", "none");
    			attr_dev(path351, "stroke", "#000");
    			attr_dev(path351, "stroke-width", ".3");
    			attr_dev(path351, "d", "m228.6 227.3.8.3-.7.4-.1-.6");
    			add_location(path351, file$c, 1312, 1, 68775);
    			attr_dev(path352, "d", "m229.5 227.6.7.2-.5.4-.2-.6");
    			add_location(path352, file$c, 1313, 1, 68861);
    			attr_dev(path353, "fill", "none");
    			attr_dev(path353, "stroke", "#000");
    			attr_dev(path353, "stroke-width", ".3");
    			attr_dev(path353, "d", "m229.5 227.6.7.2-.5.4-.2-.6");
    			add_location(path353, file$c, 1314, 1, 68903);
    			attr_dev(path354, "fill", "none");
    			attr_dev(path354, "stroke", "#000");
    			attr_dev(path354, "stroke-width", ".4");
    			attr_dev(path354, "d", "M224.2 233.7s-.7.2-1 .6c-.4.5-.3 1-.3 1s.6-.5 1.5-.3l1.2.3 1.3-.3s-.7.8-.7 1.3l.2 1.1c0 .7-.6 1.6-.6 1.6l1-.3a4.6 4.6 0 0 0 1.7-.8l.9-1s-.2 1 0 1.4l.2 1.6.8-.6c.2-.1.7-.4.9-.7l.3-1s0 .8.4 1.3l.6 1.6s.3-.8.6-1.1c.3-.4.7-.8.7-1a4.3 4.3 0 0 0-.1-.9l.4.8m-11 .6s.5-.8 1-1l1.1-.8.9-.4m1 5 1.3-.8a4 4 0 0 0 1-1");
    			add_location(path354, file$c, 1315, 1, 68989);
    			attr_dev(path355, "fill", "#db4446");
    			attr_dev(path355, "d", "M216.6 240.4s-.4-.5-1.1-.3c-.7 0-1.2.9-1.2.9s.6-.2 1-.1.6.4.6.4l.4-.4.3-.6");
    			add_location(path355, file$c, 1321, 1, 69361);
    			attr_dev(path356, "fill", "none");
    			attr_dev(path356, "stroke", "#000");
    			attr_dev(path356, "stroke-width", ".4");
    			attr_dev(path356, "d", "M216.6 240.4s-.4-.5-1.1-.3c-.7 0-1.2.9-1.2.9s.6-.2 1-.1.6.4.6.4l.4-.4.3-.6z");
    			add_location(path356, file$c, 1322, 1, 69465);
    			attr_dev(path357, "fill", "#db4446");
    			attr_dev(path357, "d", "M215.8 243.2s-.6 0-1.1.3c-.5.4-.5 1.2-.5 1.2s.4-.4.8-.3l.9.2v-.6c.2-.4-.1-.8-.1-.8");
    			add_location(path357, file$c, 1328, 1, 69608);
    			attr_dev(path358, "fill", "none");
    			attr_dev(path358, "stroke", "#000");
    			attr_dev(path358, "stroke-width", ".4");
    			attr_dev(path358, "d", "M215.8 243.2s-.6 0-1.1.3c-.5.4-.5 1.2-.5 1.2s.4-.4.8-.3l.9.2v-.6c.2-.4-.1-.8-.1-.8z");
    			add_location(path358, file$c, 1332, 1, 69725);
    			attr_dev(path359, "fill", "#db4446");
    			attr_dev(path359, "d", "M217.2 245.8s0 .8.3 1.3c.4.5 1.1.5 1.1.5l-.3-.7c0-.4.3-.8.3-.8s-.3-.3-.7-.3h-.7");
    			add_location(path359, file$c, 1338, 1, 69876);
    			attr_dev(path360, "fill", "none");
    			attr_dev(path360, "stroke", "#000");
    			attr_dev(path360, "stroke-width", ".4");
    			attr_dev(path360, "d", "M217.2 245.8s0 .8.3 1.3c.4.5 1.1.5 1.1.5l-.3-.7c0-.4.3-.8.3-.8s-.3-.3-.7-.3h-.7zm16 1.3s2 1.2 1.9 2.2c0 1-1 2.3-1 2.3");
    			add_location(path360, file$c, 1339, 1, 69985);
    			attr_dev(path361, "fill", "#db4446");
    			attr_dev(path361, "d", "M224.2 252.6s-.4-.6-1.1-.6c-.7 0-1.4.7-1.4.7s.8-.1 1 .2l.5.6.5-.3.5-.6");
    			add_location(path361, file$c, 1345, 1, 70170);
    			attr_dev(path362, "fill", "none");
    			attr_dev(path362, "stroke", "#000");
    			attr_dev(path362, "stroke-width", ".4");
    			attr_dev(path362, "d", "M224.2 252.6s-.4-.6-1.1-.6c-.7 0-1.4.7-1.4.7s.8-.1 1 .2l.5.6.5-.3.5-.6z");
    			add_location(path362, file$c, 1346, 1, 70270);
    			attr_dev(path363, "fill", "#db4446");
    			attr_dev(path363, "d", "M222.2 255.3s-1-.1-1.4.3c-.4.5-.4 1.3-.4 1.3s.6-.6 1-.5c.5 0 1 .3 1 .3v-.7l-.3-.7");
    			add_location(path363, file$c, 1352, 1, 70409);
    			attr_dev(path364, "fill", "none");
    			attr_dev(path364, "stroke", "#000");
    			attr_dev(path364, "stroke-width", ".4");
    			attr_dev(path364, "d", "M222.2 255.3s-1-.1-1.4.3c-.4.5-.4 1.3-.4 1.3s.6-.6 1-.5c.5 0 1 .3 1 .3v-.7l-.3-.7z");
    			add_location(path364, file$c, 1356, 1, 70525);
    			attr_dev(path365, "fill", "#db4446");
    			attr_dev(path365, "d", "M224 258.1s-.3.7 0 1.1c.3.5 1 .8 1 .8s-.3-.4-.2-.8c.1-.3.7-.8.7-.8l-1.4-.2");
    			add_location(path365, file$c, 1362, 1, 70675);
    			attr_dev(path366, "fill", "none");
    			attr_dev(path366, "stroke", "#000");
    			attr_dev(path366, "stroke-width", ".4");
    			attr_dev(path366, "d", "M224 258.1s-.3.7 0 1.1c.3.5 1 .8 1 .8s-.3-.4-.2-.8c.1-.3.7-.8.7-.8l-1.4-.2z");
    			add_location(path366, file$c, 1363, 1, 70779);
    			attr_dev(path367, "fill", "#db4446");
    			attr_dev(path367, "d", "M236 259.3s-.8-.2-1.2 0c-.5.3-.8 1.4-.8 1.4s.7-.6 1.2-.5c.5 0 1 .3 1 .3v-.8l-.2-.4");
    			add_location(path367, file$c, 1369, 1, 70922);
    			attr_dev(path368, "fill", "none");
    			attr_dev(path368, "stroke", "#000");
    			attr_dev(path368, "stroke-width", ".4");
    			attr_dev(path368, "d", "M236 259.3s-.8-.2-1.2 0c-.5.3-.8 1.4-.8 1.4s.7-.6 1.2-.5c.5 0 1 .3 1 .3v-.8l-.2-.4z");
    			add_location(path368, file$c, 1373, 1, 71039);
    			attr_dev(path369, "fill", "#db4446");
    			attr_dev(path369, "d", "M236.4 262.2s-.6.6-.4 1.1l.6 1s0-.7.2-1l1-.3-.7-.5a15.8 15.8 0 0 1-.7-.3");
    			add_location(path369, file$c, 1379, 1, 71190);
    			attr_dev(path370, "fill", "none");
    			attr_dev(path370, "stroke", "#000");
    			attr_dev(path370, "stroke-width", ".4");
    			attr_dev(path370, "d", "M236.4 262.2s-.6.6-.4 1.1l.6 1s0-.7.2-1l1-.3-.7-.5a15.8 15.8 0 0 1-.7-.3z");
    			add_location(path370, file$c, 1380, 1, 71292);
    			attr_dev(path371, "fill", "#db4446");
    			attr_dev(path371, "d", "M239.4 263s-.3.8.2 1.3c.6.5 1 .5 1 .5s-.3-.7-.2-1.1c.1-.5.5-.7.5-.7l-.8-.2-.7.3");
    			add_location(path371, file$c, 1386, 1, 71433);
    			attr_dev(path372, "fill", "none");
    			attr_dev(path372, "stroke", "#000");
    			attr_dev(path372, "stroke-width", ".4");
    			attr_dev(path372, "d", "M239.4 263s-.3.8.2 1.3c.6.5 1 .5 1 .5s-.3-.7-.2-1.1c.1-.5.5-.7.5-.7l-.8-.2-.7.3z");
    			add_location(path372, file$c, 1387, 1, 71542);
    			attr_dev(path373, "fill", "#ffd691");
    			attr_dev(path373, "stroke", "#000");
    			attr_dev(path373, "stroke-width", ".5");
    			attr_dev(path373, "d", "M208.8 316.4c2 .6 3 2 3 3.8 0 2.3-2.2 4-5 4-3 0-5.3-1.7-5.3-4 0-1.7 1-3.6 3-3.8l-.2-.4-.7-.7h1.2l.8.5.5-.7c.3-.4.6-.5.6-.5l.6.6.3.5.7-.4.8-.3s0 .4-.2.7l-.1.7");
    			add_location(path373, file$c, 1393, 1, 71690);
    			attr_dev(path374, "fill", "#058e6e");
    			attr_dev(path374, "stroke", "#000");
    			attr_dev(path374, "stroke-width", ".5");
    			attr_dev(path374, "d", "M206.3 326.7s-3.8-2.6-5.5-3c-2-.4-4.5 0-5.5 0 0 0 1.2.8 1.8 1.4.5.5 2.3 1.5 3.3 1.8 3 .8 6-.2 6-.2m1 .2s2.4-2.5 5-2.9c3-.4 5 .3 6.2.6l-1.5.8c-.5.3-2 1.5-4 1.6-2 0-4.4-.3-4.8-.2l-.9.1");
    			add_location(path374, file$c, 1399, 1, 71918);
    			attr_dev(path375, "fill", "#ad1519");
    			attr_dev(path375, "stroke", "#000");
    			attr_dev(path375, "stroke-width", ".5");
    			attr_dev(path375, "d", "M206.7 323.8a4.8 4.8 0 0 1 0-7.1 4.8 4.8 0 0 1 1.5 3.5 4.9 4.9 0 0 1-1.5 3.6");
    			add_location(path375, file$c, 1405, 1, 72171);
    			attr_dev(path376, "fill", "#058e6e");
    			attr_dev(path376, "stroke", "#000");
    			attr_dev(path376, "stroke-width", ".5");
    			attr_dev(path376, "d", "M205.7 329s.6-1.5.6-2.7l-.1-2.1h.8s.3 1.1.3 2l-.1 2.4-.7.1-.8.3");
    			add_location(path376, file$c, 1411, 1, 72318);
    			attr_dev(path377, "fill", "#fff");
    			attr_dev(path377, "d", "M254 190.7c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1 0 .6-.5 1-1 1a1 1 0 0 1-1-1");
    			add_location(path377, file$c, 1417, 1, 72452);
    			attr_dev(path378, "fill", "none");
    			attr_dev(path378, "stroke", "#000");
    			attr_dev(path378, "stroke-width", ".4");
    			attr_dev(path378, "d", "M254 190.7c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1 0 .6-.5 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path378, file$c, 1418, 1, 72547);
    			attr_dev(path379, "fill", "#fff");
    			attr_dev(path379, "d", "M255.4 188.2c0-.6.5-1 1.1-1 .6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path379, file$c, 1424, 1, 72684);
    			attr_dev(path380, "fill", "none");
    			attr_dev(path380, "stroke", "#000");
    			attr_dev(path380, "stroke-width", ".4");
    			attr_dev(path380, "d", "M255.4 188.2c0-.6.5-1 1.1-1 .6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path380, file$c, 1425, 1, 72776);
    			attr_dev(path381, "fill", "#fff");
    			attr_dev(path381, "d", "M256.4 185.2c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1");
    			add_location(path381, file$c, 1431, 1, 72910);
    			attr_dev(path382, "fill", "none");
    			attr_dev(path382, "stroke", "#000");
    			attr_dev(path382, "stroke-width", ".4");
    			attr_dev(path382, "d", "M256.4 185.2c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1z");
    			add_location(path382, file$c, 1432, 1, 73005);
    			attr_dev(path383, "fill", "#fff");
    			attr_dev(path383, "d", "M256.5 182c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1 0 .6-.5 1-1 1a1 1 0 0 1-1-1");
    			add_location(path383, file$c, 1438, 1, 73142);
    			attr_dev(path384, "fill", "none");
    			attr_dev(path384, "stroke", "#000");
    			attr_dev(path384, "stroke-width", ".4");
    			attr_dev(path384, "d", "M256.5 182c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1 0 .6-.5 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path384, file$c, 1439, 1, 73237);
    			attr_dev(path385, "fill", "#fff");
    			attr_dev(path385, "d", "M255.7 179c0-.6.5-1 1-1 .7 0 1.2.4 1.2 1s-.5 1-1.1 1a1 1 0 0 1-1-1");
    			add_location(path385, file$c, 1445, 1, 73374);
    			attr_dev(path386, "fill", "none");
    			attr_dev(path386, "stroke", "#000");
    			attr_dev(path386, "stroke-width", ".4");
    			attr_dev(path386, "d", "M255.7 179c0-.6.5-1 1-1 .7 0 1.2.4 1.2 1s-.5 1-1.1 1a1 1 0 0 1-1-1z");
    			add_location(path386, file$c, 1446, 1, 73467);
    			attr_dev(path387, "fill", "#fff");
    			attr_dev(path387, "d", "M254.1 176.1c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path387, file$c, 1452, 1, 73602);
    			attr_dev(path388, "fill", "none");
    			attr_dev(path388, "stroke", "#000");
    			attr_dev(path388, "stroke-width", ".4");
    			attr_dev(path388, "d", "M254.1 176.1c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path388, file$c, 1453, 1, 73695);
    			attr_dev(path389, "fill", "#fff");
    			attr_dev(path389, "d", "M252 173.8c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path389, file$c, 1459, 1, 73830);
    			attr_dev(path390, "fill", "none");
    			attr_dev(path390, "stroke", "#000");
    			attr_dev(path390, "stroke-width", ".4");
    			attr_dev(path390, "d", "M252 173.8c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path390, file$c, 1460, 1, 73912);
    			attr_dev(path391, "fill", "#fff");
    			attr_dev(path391, "d", "M249.4 171.8c0-.5.5-1 1.1-1a1 1 0 0 1 0 2c-.6 0-1-.4-1-1");
    			add_location(path391, file$c, 1466, 1, 74036);
    			attr_dev(path392, "fill", "none");
    			attr_dev(path392, "stroke", "#000");
    			attr_dev(path392, "stroke-width", ".4");
    			attr_dev(path392, "d", "M249.4 171.8c0-.5.5-1 1.1-1a1 1 0 0 1 0 2c-.6 0-1-.4-1-1z");
    			add_location(path392, file$c, 1467, 1, 74119);
    			attr_dev(path393, "fill", "#fff");
    			attr_dev(path393, "d", "M246.5 170.3c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path393, file$c, 1473, 1, 74244);
    			attr_dev(path394, "fill", "none");
    			attr_dev(path394, "stroke", "#000");
    			attr_dev(path394, "stroke-width", ".4");
    			attr_dev(path394, "d", "M246.5 170.3c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path394, file$c, 1474, 1, 74328);
    			attr_dev(path395, "fill", "#fff");
    			attr_dev(path395, "d", "M243.3 169.1c0-.5.5-1 1.1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1");
    			add_location(path395, file$c, 1480, 1, 74454);
    			attr_dev(path396, "fill", "none");
    			attr_dev(path396, "stroke", "#000");
    			attr_dev(path396, "stroke-width", ".4");
    			attr_dev(path396, "d", "M243.3 169.1c0-.5.5-1 1.1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1z");
    			add_location(path396, file$c, 1481, 1, 74536);
    			attr_dev(path397, "fill", "#fff");
    			attr_dev(path397, "d", "M239.9 168.5c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path397, file$c, 1487, 1, 74660);
    			attr_dev(path398, "fill", "none");
    			attr_dev(path398, "stroke", "#000");
    			attr_dev(path398, "stroke-width", ".4");
    			attr_dev(path398, "d", "M239.9 168.5c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path398, file$c, 1488, 1, 74744);
    			attr_dev(path399, "fill", "#fff");
    			attr_dev(path399, "d", "M236.6 168.3c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path399, file$c, 1494, 1, 74870);
    			attr_dev(path400, "fill", "none");
    			attr_dev(path400, "stroke", "#000");
    			attr_dev(path400, "stroke-width", ".4");
    			attr_dev(path400, "d", "M236.6 168.3c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path400, file$c, 1495, 1, 74954);
    			attr_dev(path401, "fill", "#fff");
    			attr_dev(path401, "d", "M233.3 168.5c0-.6.5-1 1-1 .7 0 1.1.4 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path401, file$c, 1501, 1, 75080);
    			attr_dev(path402, "fill", "none");
    			attr_dev(path402, "stroke", "#000");
    			attr_dev(path402, "stroke-width", ".4");
    			attr_dev(path402, "d", "M233.3 168.5c0-.6.5-1 1-1 .7 0 1.1.4 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path402, file$c, 1502, 1, 75173);
    			attr_dev(path403, "fill", "#fff");
    			attr_dev(path403, "d", "M230.1 168.5c0-.6.5-1 1-1 .6 0 1.1.4 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1");
    			add_location(path403, file$c, 1508, 1, 75308);
    			attr_dev(path404, "fill", "none");
    			attr_dev(path404, "stroke", "#000");
    			attr_dev(path404, "stroke-width", ".4");
    			attr_dev(path404, "d", "M230.1 168.5c0-.6.5-1 1-1 .6 0 1.1.4 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1z");
    			add_location(path404, file$c, 1509, 1, 75403);
    			attr_dev(path405, "fill", "#fff");
    			attr_dev(path405, "stroke", "#000");
    			attr_dev(path405, "stroke-width", ".4");
    			attr_dev(path405, "d", "M231.7 171.2c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1m.6 3.1c0-.6.4-1 1-1s1 .4 1 1c0 .5-.4 1-1 1a1 1 0 0 1-1-1m0 3c0-.5.6-1 1.1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1m-1 2.8c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1 0 .6-.4 1-1 1a1 1 0 0 1-1-1m-1.9 2.6c0-.5.5-1 1-1 .7 0 1.2.5 1.2 1s-.5 1-1.1 1c-.6 0-1-.4-1-1");
    			add_location(path405, file$c, 1515, 1, 75540);
    			attr_dev(path406, "fill", "#fff");
    			attr_dev(path406, "d", "M227.6 166.5c0-.5.5-1 1.1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1");
    			add_location(path406, file$c, 1521, 1, 75909);
    			attr_dev(path407, "fill", "none");
    			attr_dev(path407, "stroke", "#000");
    			attr_dev(path407, "stroke-width", ".4");
    			attr_dev(path407, "d", "M227.6 166.5c0-.5.5-1 1.1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1z");
    			add_location(path407, file$c, 1522, 1, 75991);
    			attr_dev(path408, "fill", "#fff");
    			attr_dev(path408, "d", "M224.8 165c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path408, file$c, 1528, 1, 76115);
    			attr_dev(path409, "fill", "none");
    			attr_dev(path409, "stroke", "#000");
    			attr_dev(path409, "stroke-width", ".4");
    			attr_dev(path409, "d", "M224.8 165c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path409, file$c, 1529, 1, 76197);
    			attr_dev(path410, "fill", "#fff");
    			attr_dev(path410, "d", "M221.6 164c0-.6.5-1 1-1 .6 0 1.1.4 1.1 1 0 .5-.5 1-1 1-.6 0-1.1-.5-1.1-1");
    			add_location(path410, file$c, 1535, 1, 76321);
    			attr_dev(path411, "fill", "none");
    			attr_dev(path411, "stroke", "#000");
    			attr_dev(path411, "stroke-width", ".4");
    			attr_dev(path411, "d", "M221.6 164c0-.6.5-1 1-1 .6 0 1.1.4 1.1 1 0 .5-.5 1-1 1-.6 0-1.1-.5-1.1-1z");
    			add_location(path411, file$c, 1536, 1, 76420);
    			attr_dev(path412, "fill", "#fff");
    			attr_dev(path412, "d", "M218.3 163.4c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1");
    			add_location(path412, file$c, 1542, 1, 76561);
    			attr_dev(path413, "fill", "none");
    			attr_dev(path413, "stroke", "#000");
    			attr_dev(path413, "stroke-width", ".4");
    			attr_dev(path413, "d", "M218.3 163.4c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1z");
    			add_location(path413, file$c, 1543, 1, 76656);
    			attr_dev(path414, "fill", "#fff");
    			attr_dev(path414, "d", "M215 163.5c0-.6.5-1 1.1-1 .6 0 1 .4 1 1 0 .5-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path414, file$c, 1549, 1, 76793);
    			attr_dev(path415, "fill", "none");
    			attr_dev(path415, "stroke", "#000");
    			attr_dev(path415, "stroke-width", ".4");
    			attr_dev(path415, "d", "M215 163.5c0-.6.5-1 1.1-1 .6 0 1 .4 1 1 0 .5-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path415, file$c, 1550, 1, 76887);
    			attr_dev(path416, "fill", "#fff");
    			attr_dev(path416, "d", "M211.7 164c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path416, file$c, 1556, 1, 77023);
    			attr_dev(path417, "fill", "none");
    			attr_dev(path417, "stroke", "#000");
    			attr_dev(path417, "stroke-width", ".4");
    			attr_dev(path417, "d", "M211.7 164c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path417, file$c, 1557, 1, 77114);
    			attr_dev(path418, "fill", "#fff");
    			attr_dev(path418, "d", "M208.6 165.1c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1");
    			add_location(path418, file$c, 1563, 1, 77247);
    			attr_dev(path419, "fill", "none");
    			attr_dev(path419, "stroke", "#000");
    			attr_dev(path419, "stroke-width", ".4");
    			attr_dev(path419, "d", "M208.6 165.1c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1z");
    			add_location(path419, file$c, 1564, 1, 77342);
    			attr_dev(path420, "fill", "#fff");
    			attr_dev(path420, "d", "M156 190.7c0-.5.4-1 1-1s1 .5 1 1c0 .6-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path420, file$c, 1570, 1, 77479);
    			attr_dev(path421, "fill", "none");
    			attr_dev(path421, "stroke", "#000");
    			attr_dev(path421, "stroke-width", ".4");
    			attr_dev(path421, "d", "M156 190.7c0-.5.4-1 1-1s1 .5 1 1c0 .6-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path421, file$c, 1571, 1, 77566);
    			attr_dev(path422, "fill", "#fff");
    			attr_dev(path422, "d", "M154.5 188.2c0-.6.5-1 1-1 .6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path422, file$c, 1577, 1, 77695);
    			attr_dev(path423, "fill", "none");
    			attr_dev(path423, "stroke", "#000");
    			attr_dev(path423, "stroke-width", ".4");
    			attr_dev(path423, "d", "M154.5 188.2c0-.6.5-1 1-1 .6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path423, file$c, 1578, 1, 77785);
    			attr_dev(path424, "fill", "#fff");
    			attr_dev(path424, "d", "M153.5 185.2c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path424, file$c, 1584, 1, 77917);
    			attr_dev(path425, "fill", "none");
    			attr_dev(path425, "stroke", "#000");
    			attr_dev(path425, "stroke-width", ".4");
    			attr_dev(path425, "d", "M153.5 185.2c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path425, file$c, 1585, 1, 78010);
    			attr_dev(path426, "fill", "#fff");
    			attr_dev(path426, "d", "M153.4 182c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1 0 .6-.5 1-1 1a1 1 0 0 1-1-1");
    			add_location(path426, file$c, 1591, 1, 78145);
    			attr_dev(path427, "fill", "none");
    			attr_dev(path427, "stroke", "#000");
    			attr_dev(path427, "stroke-width", ".4");
    			attr_dev(path427, "d", "M153.4 182c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1 0 .6-.5 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path427, file$c, 1592, 1, 78240);
    			attr_dev(path428, "fill", "#fff");
    			attr_dev(path428, "d", "M154.2 179c0-.6.5-1 1-1 .6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path428, file$c, 1598, 1, 78377);
    			attr_dev(path429, "fill", "none");
    			attr_dev(path429, "stroke", "#000");
    			attr_dev(path429, "stroke-width", ".4");
    			attr_dev(path429, "d", "M154.2 179c0-.6.5-1 1-1 .6 0 1 .4 1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path429, file$c, 1599, 1, 78465);
    			attr_dev(path430, "fill", "#fff");
    			attr_dev(path430, "d", "M155.8 176.1c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1s-.5 1-1 1a1 1 0 0 1-1-1");
    			add_location(path430, file$c, 1605, 1, 78595);
    			attr_dev(path431, "fill", "none");
    			attr_dev(path431, "stroke", "#000");
    			attr_dev(path431, "stroke-width", ".4");
    			attr_dev(path431, "d", "M155.8 176.1c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1s-.5 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path431, file$c, 1606, 1, 78688);
    			attr_dev(path432, "fill", "#fff");
    			attr_dev(path432, "d", "M158 173.8c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path432, file$c, 1612, 1, 78823);
    			attr_dev(path433, "fill", "none");
    			attr_dev(path433, "stroke", "#000");
    			attr_dev(path433, "stroke-width", ".4");
    			attr_dev(path433, "d", "M158 173.8c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path433, file$c, 1613, 1, 78905);
    			attr_dev(path434, "fill", "#fff");
    			attr_dev(path434, "d", "M160.5 171.8c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path434, file$c, 1619, 1, 79029);
    			attr_dev(path435, "fill", "none");
    			attr_dev(path435, "stroke", "#000");
    			attr_dev(path435, "stroke-width", ".4");
    			attr_dev(path435, "d", "M160.5 171.8c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path435, file$c, 1620, 1, 79113);
    			attr_dev(path436, "fill", "#fff");
    			attr_dev(path436, "d", "M163.5 170.3c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path436, file$c, 1626, 1, 79239);
    			attr_dev(path437, "fill", "none");
    			attr_dev(path437, "stroke", "#000");
    			attr_dev(path437, "stroke-width", ".4");
    			attr_dev(path437, "d", "M163.5 170.3c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path437, file$c, 1627, 1, 79323);
    			attr_dev(path438, "fill", "#fff");
    			attr_dev(path438, "d", "M166.6 169.1c0-.5.5-1 1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1");
    			add_location(path438, file$c, 1633, 1, 79449);
    			attr_dev(path439, "fill", "none");
    			attr_dev(path439, "stroke", "#000");
    			attr_dev(path439, "stroke-width", ".4");
    			attr_dev(path439, "d", "M166.6 169.1c0-.5.5-1 1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1z");
    			add_location(path439, file$c, 1634, 1, 79529);
    			attr_dev(path440, "fill", "#fff");
    			attr_dev(path440, "d", "M170 168.5c0-.5.5-1 1.1-1a1 1 0 0 1 0 2c-.6 0-1-.4-1-1");
    			add_location(path440, file$c, 1640, 1, 79651);
    			attr_dev(path441, "fill", "none");
    			attr_dev(path441, "stroke", "#000");
    			attr_dev(path441, "stroke-width", ".4");
    			attr_dev(path441, "d", "M170 168.5c0-.5.5-1 1.1-1a1 1 0 0 1 0 2c-.6 0-1-.4-1-1z");
    			add_location(path441, file$c, 1641, 1, 79732);
    			attr_dev(path442, "fill", "#fff");
    			attr_dev(path442, "d", "M173.4 168.3c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path442, file$c, 1647, 1, 79855);
    			attr_dev(path443, "fill", "none");
    			attr_dev(path443, "stroke", "#000");
    			attr_dev(path443, "stroke-width", ".4");
    			attr_dev(path443, "d", "M173.4 168.3c0-.5.4-1 1-1s1 .5 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path443, file$c, 1648, 1, 79939);
    			attr_dev(path444, "fill", "#fff");
    			attr_dev(path444, "d", "M176.6 168.5c0-.6.5-1 1-1 .6 0 1.1.4 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1");
    			add_location(path444, file$c, 1654, 1, 80065);
    			attr_dev(path445, "fill", "none");
    			attr_dev(path445, "stroke", "#000");
    			attr_dev(path445, "stroke-width", ".4");
    			attr_dev(path445, "d", "M176.6 168.5c0-.6.5-1 1-1 .6 0 1.1.4 1.1 1s-.5 1-1 1a1 1 0 0 1-1.1-1z");
    			add_location(path445, file$c, 1655, 1, 80160);
    			attr_dev(path446, "fill", "#fff");
    			attr_dev(path446, "d", "M179.8 168.5c0-.6.5-1 1-1 .7 0 1.2.4 1.2 1s-.5 1-1.1 1a1 1 0 0 1-1-1");
    			add_location(path446, file$c, 1661, 1, 80297);
    			attr_dev(path447, "fill", "none");
    			attr_dev(path447, "stroke", "#000");
    			attr_dev(path447, "stroke-width", ".4");
    			attr_dev(path447, "d", "M179.8 168.5c0-.6.5-1 1-1 .7 0 1.2.4 1.2 1s-.5 1-1.1 1a1 1 0 0 1-1-1z");
    			add_location(path447, file$c, 1662, 1, 80392);
    			attr_dev(path448, "fill", "#fff");
    			attr_dev(path448, "stroke", "#000");
    			attr_dev(path448, "stroke-width", ".4");
    			attr_dev(path448, "d", "M178.2 171.2c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1m-.7 3.1c0-.6.4-1 1-1s1 .4 1 1c0 .5-.4 1-1 1a1 1 0 0 1-1-1m-.2 3c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1m.9 2.8c0-.5.5-1 1-1 .6 0 1.1.5 1.1 1 0 .6-.5 1-1 1a1 1 0 0 1-1.1-1m1.8 2.6c0-.5.5-1 1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1");
    			add_location(path448, file$c, 1668, 1, 80529);
    			attr_dev(path449, "fill", "#fff");
    			attr_dev(path449, "d", "M182.3 166.5c0-.5.5-1 1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1");
    			add_location(path449, file$c, 1674, 1, 80897);
    			attr_dev(path450, "fill", "none");
    			attr_dev(path450, "stroke", "#000");
    			attr_dev(path450, "stroke-width", ".4");
    			attr_dev(path450, "d", "M182.3 166.5c0-.5.5-1 1-1a1 1 0 0 1 0 2 1 1 0 0 1-1-1z");
    			add_location(path450, file$c, 1675, 1, 80977);
    			attr_dev(path451, "fill", "#fff");
    			attr_dev(path451, "d", "M185.2 165c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path451, file$c, 1681, 1, 81099);
    			attr_dev(path452, "fill", "none");
    			attr_dev(path452, "stroke", "#000");
    			attr_dev(path452, "stroke-width", ".4");
    			attr_dev(path452, "d", "M185.2 165c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path452, file$c, 1682, 1, 81181);
    			attr_dev(path453, "fill", "#fff");
    			attr_dev(path453, "d", "M188.3 164c0-.6.5-1 1-1 .7 0 1.1.4 1.1 1 0 .5-.4 1-1 1s-1-.5-1-1");
    			add_location(path453, file$c, 1688, 1, 81305);
    			attr_dev(path454, "fill", "none");
    			attr_dev(path454, "stroke", "#000");
    			attr_dev(path454, "stroke-width", ".4");
    			attr_dev(path454, "d", "M188.3 164c0-.6.5-1 1-1 .7 0 1.1.4 1.1 1 0 .5-.4 1-1 1s-1-.5-1-1z");
    			add_location(path454, file$c, 1689, 1, 81396);
    			attr_dev(path455, "fill", "#fff");
    			attr_dev(path455, "d", "M191.6 163.4c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path455, file$c, 1695, 1, 81529);
    			attr_dev(path456, "fill", "none");
    			attr_dev(path456, "stroke", "#000");
    			attr_dev(path456, "stroke-width", ".4");
    			attr_dev(path456, "d", "M191.6 163.4c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path456, file$c, 1696, 1, 81622);
    			attr_dev(path457, "fill", "#fff");
    			attr_dev(path457, "d", "M194.9 163.5c0-.6.4-1 1-1s1 .4 1 1c0 .5-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path457, file$c, 1702, 1, 81757);
    			attr_dev(path458, "fill", "none");
    			attr_dev(path458, "stroke", "#000");
    			attr_dev(path458, "stroke-width", ".4");
    			attr_dev(path458, "d", "M194.9 163.5c0-.6.4-1 1-1s1 .4 1 1c0 .5-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path458, file$c, 1703, 1, 81846);
    			attr_dev(path459, "fill", "#fff");
    			attr_dev(path459, "d", "M198.2 164c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path459, file$c, 1709, 1, 81977);
    			attr_dev(path460, "fill", "none");
    			attr_dev(path460, "stroke", "#000");
    			attr_dev(path460, "stroke-width", ".4");
    			attr_dev(path460, "d", "M198.2 164c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path460, file$c, 1710, 1, 82068);
    			attr_dev(path461, "fill", "#fff");
    			attr_dev(path461, "d", "M201.3 165.1c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1");
    			add_location(path461, file$c, 1716, 1, 82201);
    			attr_dev(path462, "fill", "none");
    			attr_dev(path462, "stroke", "#000");
    			attr_dev(path462, "stroke-width", ".4");
    			attr_dev(path462, "d", "M201.3 165.1c0-.5.5-1 1-1 .7 0 1.1.5 1.1 1s-.4 1-1 1a1 1 0 0 1-1-1z");
    			add_location(path462, file$c, 1717, 1, 82294);
    			attr_dev(path463, "fill", "#c8b100");
    			attr_dev(path463, "stroke", "#000");
    			attr_dev(path463, "stroke-width", ".4");
    			attr_dev(path463, "d", "M174.7 228.9h-1v-1h-1.5v3.6h1.6v2.5h-3.4v7h1.8v14.3h-3.5v7.3h27.2v-7.3h-3.5V241h1.8v-7h-3.4v-2.5h1.6V228h-1.6v.9h-.8v-1h-1.6v1h-1.1v-1h-1.6v3.6h1.6v2.5H184v-7.8h1.7v-3.5H184v.9h-1v-1h-1.5v1h-.9v-1H179v3.6h1.7v7.8h-3.3v-2.5h1.6V228h-1.6v.9h-.9v-1h-1.8v1zm-6 33.7H196m-27.3-1.8H196m-27.3-1.8H196m-27.3-1.7H196m-27.3-2H196m-23.8-1.6h20.2m-20.2-1.8h20.2m-20.2-2h20.2m-20.2-1.7h20.2m-20.2-1.8h20.2m-20.2-1.8h20.2m-20.2-1.7h20.2m-22-1.8h23.8m-23.8-1.8h23.8m-23.8-1.8h23.8m-23.8-1.8h23.8m-20.4-1.7h17m-10.2-1.8h3.4m-3.4-1.8h3.4m-3.4-1.8h3.4m-3.4-1.7h3.4m-5.1-2.2h6.8m-12 7.5h3.6m-5-2.2h6.6m-6.7 32.6v-1.8m0-1.8v-1.7m-1.8 1.7v1.8m3.4 0V259m1.7 3.6v-1.8m0-1.8v-1.7m0-2v-1.6m0-1.8v-2m-1.7 7.4v-2m-3.4 2v-2m7 0v2m1.5-2v-1.6m-5.1-1.8v1.8m3.5-1.8v1.8m3.3-1.8v1.8M179 252v-2m1.7-1.7v1.7m0-5.3v1.8m-1.7-3.6v1.8m1.7-3.5v1.7m-3.3-1.7v1.7m-3.5-1.7v1.7m-1.6-3.5v1.8m3.3-1.8v1.8m3.4-1.8v1.8m1.7-3.6v1.8m-3.3-1.8v1.8m-3.5-1.8v1.8m-1.6-3.6v1.8m6.7-1.8v1.8m-3.4-5.3v1.8m15.3-1.8h-3.5m5-2.2h-6.6m6.7 32.6v-1.8m0-1.8v-1.7m1.8 1.7v1.8m-3.4 0V259m-1.7 3.6v-1.8m0-1.8v-1.7m0-2v-1.6m0-1.8v-2m1.7 7.4v-2m3.4 2v-2m-7 0v2m-1.5-2v-1.6m5.1-1.8v1.8m-3.5-1.8v1.8m-3.3-1.8v1.8m1.7-1.8v-2m-1.7-1.7v1.7m0-5.3v1.8m1.7-3.6v1.8m-1.7-3.5v1.7m3.3-1.7v1.7m3.5-1.7v1.7m1.6-3.5v1.8m-3.3-1.8v1.8m-3.4-1.8v1.8m-1.7-3.6v1.8m3.3-1.8v1.8m3.5-1.8v1.8m1.6-3.6v1.8m-6.7-1.8v1.8m3.4-5.3v1.8m-7 18v-2m0-5.4v-1.8m0 5.4v-1.8m0-5.3v-1.8m0-1.8v-1.7m0-3.6v-1.8m0-1.7v-1.8m-8.3 4.6h3.5m3.3-5.3h3.4m3.3 5.3h3.5");
    			add_location(path463, file$c, 1723, 1, 82429);
    			attr_dev(path464, "fill", "#c8b100");
    			attr_dev(path464, "stroke", "#000");
    			attr_dev(path464, "stroke-width", ".4");
    			attr_dev(path464, "d", "M186.8 262.6v-4.7c0-.8-.4-3.5-4.6-3.5-4 0-4.4 2.7-4.4 3.5v4.7h9z");
    			add_location(path464, file$c, 1729, 1, 83946);
    			attr_dev(path465, "fill", "#c8b100");
    			attr_dev(path465, "stroke", "#000");
    			attr_dev(path465, "stroke-width", ".4");
    			attr_dev(path465, "d", "m179.3 258.2-2.2-.3c0-.9.2-2.2.9-2.6l2 1.5c-.3.2-.7 1-.7 1.4zm6 0 2.2-.3c0-.9-.2-2.2-.9-2.6l-2 1.5c.3.2.7 1 .7 1.4zm-2.2-2.3 1-2a5.3 5.3 0 0 0-2-.4l-1.7.4 1.1 2h1.6zm-4.2-5.5v-4.9c0-1.3-1-2.4-2.5-2.4s-2.4 1-2.4 2.4v4.9h4.9zm6.8 0v-4.9c0-1.3 1-2.4 2.5-2.4s2.4 1 2.4 2.4v4.9h-4.9zm-1.7-12 .4-4.4h-4.2l.2 4.4h3.6zm3.3 0-.4-4.4h4.4l-.5 4.4h-3.5zm-10 0 .2-4.4h-4.2l.5 4.4h3.5z");
    			add_location(path465, file$c, 1735, 1, 84081);
    			attr_dev(path466, "fill", "#0039f0");
    			attr_dev(path466, "d", "M185.3 262.6v-4c0-.7-.5-2.7-3.1-2.7-2.4 0-2.9 2-2.9 2.7v4h6zm-6.9-12.7v-4.2c0-1-.6-2.2-2-2.2s-2 1.1-2 2.2v4.3h4zm7.8 0v-4.2c0-1 .7-2.2 2-2.2s2 1.1 2 2.2v4.3h-4z");
    			add_location(path466, file$c, 1741, 1, 84523);
    			attr_dev(path467, "fill", "#ad1519");
    			attr_dev(path467, "d", "M190.8 269.8c0-9.7 7-17.6 15.6-17.6s15.6 7.9 15.6 17.6-7 17.5-15.6 17.5-15.6-7.8-15.6-17.5");
    			add_location(path467, file$c, 1745, 1, 84718);
    			attr_dev(path468, "fill", "none");
    			attr_dev(path468, "stroke", "#000");
    			attr_dev(path468, "stroke-width", ".6");
    			attr_dev(path468, "d", "M190.8 269.8c0-9.7 7-17.6 15.6-17.6s15.6 7.9 15.6 17.6-7 17.5-15.6 17.5-15.6-7.8-15.6-17.5z");
    			add_location(path468, file$c, 1749, 1, 84843);
    			attr_dev(path469, "fill", "#005bbf");
    			attr_dev(path469, "d", "M195.4 269.7c0-7 5-12.8 11-12.8s11 5.7 11 12.8c0 7.2-5 13-11 13s-11-5.8-11-13");
    			add_location(path469, file$c, 1755, 1, 85002);
    			attr_dev(path470, "fill", "none");
    			attr_dev(path470, "stroke", "#000");
    			attr_dev(path470, "stroke-width", ".6");
    			attr_dev(path470, "d", "M195.4 269.7c0-7 5-12.8 11-12.8s11 5.7 11 12.8c0 7.2-5 13-11 13s-11-5.8-11-13z");
    			add_location(path470, file$c, 1756, 1, 85109);
    			attr_dev(path471, "fill", "#c8b100");
    			attr_dev(path471, "d", "M201.2 260.9s-1.3 1.4-1.3 2.7a6 6 0 0 0 .6 2.4c-.2-.5-.8-.8-1.4-.8-.8 0-1.4.6-1.4 1.3l.2.8.5.9c.1-.3.5-.5 1-.5s1 .4 1 1a.9.9 0 0 1 0 .2h-1.2v1h1l-.8 1.5 1-.4.8.9.8-.9 1 .4-.7-1.5h1v-1h-1.1a.9.9 0 0 1 0-.3 1 1 0 0 1 1-1c.4 0 .7.3 1 .6l.4-1 .2-.7a1.4 1.4 0 0 0-1.4-1.3c-.7 0-1.2.3-1.4.9 0 0 .6-1.2.6-2.5s-1.4-2.7-1.4-2.7");
    			add_location(path471, file$c, 1762, 1, 85255);
    			attr_dev(path472, "fill", "none");
    			attr_dev(path472, "stroke", "#000");
    			attr_dev(path472, "stroke-linejoin", "round");
    			attr_dev(path472, "stroke-width", ".3");
    			attr_dev(path472, "d", "M201.2 260.9s-1.3 1.4-1.3 2.7a6 6 0 0 0 .6 2.4c-.2-.5-.8-.8-1.4-.8-.8 0-1.4.6-1.4 1.3l.2.8.5.9c.1-.3.5-.5 1-.5s1 .4 1 1a.9.9 0 0 1 0 .2h-1.2v1h1l-.8 1.5 1-.4.8.9.8-.9 1 .4-.7-1.5h1v-1h-1.1a.9.9 0 0 1 0-.3 1 1 0 0 1 1-1c.4 0 .7.3 1 .6l.4-1 .2-.7a1.4 1.4 0 0 0-1.4-1.3c-.7 0-1.2.3-1.4.9 0 0 .6-1.2.6-2.5s-1.4-2.7-1.4-2.7z");
    			add_location(path472, file$c, 1766, 1, 85608);
    			attr_dev(path473, "fill", "#c8b100");
    			attr_dev(path473, "d", "M199.2 269.9h4.1v-1h-4.1v1z");
    			add_location(path473, file$c, 1773, 1, 86021);
    			attr_dev(path474, "fill", "none");
    			attr_dev(path474, "stroke", "#000");
    			attr_dev(path474, "stroke-width", ".3");
    			attr_dev(path474, "d", "M199.2 269.9h4.1v-1h-4.1v1z");
    			add_location(path474, file$c, 1774, 1, 86078);
    			attr_dev(path475, "fill", "#c8b100");
    			attr_dev(path475, "d", "M211.4 260.9s-1.3 1.4-1.3 2.7c0 1.3.6 2.4.6 2.4-.2-.5-.7-.8-1.4-.8-.8 0-1.4.6-1.4 1.3l.2.8.5.9c.2-.3.5-.5 1-.5a1 1 0 0 1 1 1 .9.9 0 0 1 0 .2h-1.2v1h1l-.8 1.5 1-.4.8.9.8-.9 1 .4-.7-1.5h1v-1h-1.1a.8.8 0 0 1 0-.3 1 1 0 0 1 1-1c.4 0 .8.3 1 .6l.4-1 .2-.7a1.4 1.4 0 0 0-1.4-1.3c-.6 0-1.2.3-1.4.9 0 0 .6-1.2.6-2.5s-1.4-2.7-1.4-2.7");
    			add_location(path475, file$c, 1775, 1, 86164);
    			attr_dev(path476, "fill", "none");
    			attr_dev(path476, "stroke", "#000");
    			attr_dev(path476, "stroke-linejoin", "round");
    			attr_dev(path476, "stroke-width", ".3");
    			attr_dev(path476, "d", "M211.4 260.9s-1.3 1.4-1.3 2.7c0 1.3.6 2.4.6 2.4-.2-.5-.7-.8-1.4-.8-.8 0-1.4.6-1.4 1.3l.2.8.5.9c.2-.3.5-.5 1-.5a1 1 0 0 1 1 1 .9.9 0 0 1 0 .2h-1.2v1h1l-.8 1.5 1-.4.8.9.8-.9 1 .4-.7-1.5h1v-1h-1.1a.8.8 0 0 1 0-.3 1 1 0 0 1 1-1c.4 0 .8.3 1 .6l.4-1 .2-.7a1.4 1.4 0 0 0-1.4-1.3c-.6 0-1.2.3-1.4.9 0 0 .6-1.2.6-2.5s-1.4-2.7-1.4-2.7z");
    			add_location(path476, file$c, 1779, 1, 86522);
    			attr_dev(path477, "fill", "#c8b100");
    			attr_dev(path477, "d", "M209.4 269.9h4.1v-1h-4.1v1z");
    			add_location(path477, file$c, 1786, 1, 86940);
    			attr_dev(path478, "fill", "none");
    			attr_dev(path478, "stroke", "#000");
    			attr_dev(path478, "stroke-width", ".3");
    			attr_dev(path478, "d", "M209.4 269.9h4.1v-1h-4.1v1z");
    			add_location(path478, file$c, 1787, 1, 86997);
    			attr_dev(path479, "fill", "#c8b100");
    			attr_dev(path479, "d", "M206.3 269.6s-1.3 1.5-1.3 2.8.6 2.4.6 2.4c-.2-.5-.7-.9-1.4-.9-.8 0-1.4.6-1.4 1.4l.2.7.5 1c.1-.4.5-.6 1-.6a1 1 0 0 1 1 1 .9.9 0 0 1 0 .3h-1.2v1h1l-.8 1.5 1-.4.8.9.8-1 1 .5-.7-1.5h1v-1h-1.1a.9.9 0 0 1 0-.3 1 1 0 0 1 1-1c.4 0 .7.2.9.6l.5-1 .2-.7a1.4 1.4 0 0 0-1.4-1.4c-.7 0-1.2.4-1.4 1 0 0 .6-1.2.6-2.5s-1.4-2.7-1.4-2.7");
    			add_location(path479, file$c, 1788, 1, 87083);
    			attr_dev(path480, "fill", "none");
    			attr_dev(path480, "stroke", "#000");
    			attr_dev(path480, "stroke-linejoin", "round");
    			attr_dev(path480, "stroke-width", ".3");
    			attr_dev(path480, "d", "M206.3 269.6s-1.3 1.5-1.3 2.8.6 2.4.6 2.4c-.2-.5-.7-.9-1.4-.9-.8 0-1.4.6-1.4 1.4l.2.7.5 1c.1-.4.5-.6 1-.6a1 1 0 0 1 1 1 .9.9 0 0 1 0 .3h-1.2v1h1l-.8 1.5 1-.4.8.9.8-1 1 .5-.7-1.5h1v-1h-1.1a.9.9 0 0 1 0-.3 1 1 0 0 1 1-1c.4 0 .7.2.9.6l.5-1 .2-.7a1.4 1.4 0 0 0-1.4-1.4c-.7 0-1.2.4-1.4 1 0 0 .6-1.2.6-2.5s-1.4-2.7-1.4-2.7z");
    			add_location(path480, file$c, 1792, 1, 87434);
    			attr_dev(path481, "fill", "#c8b100");
    			attr_dev(path481, "d", "M204.3 278.6h4.1v-1h-4.1v1z");
    			add_location(path481, file$c, 1799, 1, 87845);
    			attr_dev(path482, "fill", "none");
    			attr_dev(path482, "stroke", "#000");
    			attr_dev(path482, "stroke-width", ".3");
    			attr_dev(path482, "d", "M204.3 278.6h4.1v-1h-4.1v1z");
    			add_location(path482, file$c, 1800, 1, 87902);
    			attr_dev(path483, "fill", "#c8b100");
    			attr_dev(path483, "d", "M237.6 223.4h-.3a1.5 1.5 0 0 1-.3.4c-.2.2-.6.2-.8 0a.5.5 0 0 1-.1-.4.5.5 0 0 1-.5 0c-.3-.1-.3-.5-.1-.7v-.5h-.3l-.1.2c-.2.3-.5.3-.7.2a.6.6 0 0 1 0-.2h-.3c-.5.2-.7-1-.7-1.2l-.2.2s.2.7.1 1.2c0 .6-.3 1.2-.3 1.2a9 9 0 0 1 2.9 1.6 9 9 0 0 1 2.2 2.3l1.2-.5c.6-.2 1.3-.2 1.3-.2l.2-.2c-.3 0-1.5.1-1.5-.4v-.2a.7.7 0 0 1-.2 0c-.2-.2-.2-.4 0-.7l.2-.1v-.3h-.3l-.2.1c-.2.3-.6.3-.8 0a.4.4 0 0 1-.1-.4.6.6 0 0 1-.5 0c-.2-.2-.3-.5 0-.8l.2-.3v-.3");
    			add_location(path483, file$c, 1801, 1, 87988);
    			attr_dev(path484, "fill", "none");
    			attr_dev(path484, "stroke", "#000");
    			attr_dev(path484, "stroke-width", ".3");
    			attr_dev(path484, "d", "M237.6 223.4h-.3a1.5 1.5 0 0 1-.3.4c-.2.2-.6.2-.8 0a.5.5 0 0 1-.1-.4.5.5 0 0 1-.5 0c-.3-.1-.3-.5-.1-.7v-.5h-.3l-.1.2c-.2.3-.5.3-.7.2a.6.6 0 0 1 0-.2h-.3c-.5.2-.7-1-.7-1.2l-.2.2s.2.7.1 1.2c0 .6-.3 1.2-.3 1.2a9 9 0 0 1 2.9 1.6 9 9 0 0 1 2.2 2.3l1.2-.5c.6-.2 1.3-.2 1.3-.2l.2-.2c-.3 0-1.5.1-1.5-.4v-.2a.7.7 0 0 1-.2 0c-.2-.2-.2-.4 0-.7l.2-.1v-.3h-.3l-.2.1c-.2.3-.6.3-.8 0a.4.4 0 0 1-.1-.4.6.6 0 0 1-.5 0c-.2-.2-.3-.5 0-.8l.2-.3v-.3z");
    			add_location(path484, file$c, 1805, 1, 88451);
    			attr_dev(path485, "d", "M235.4 224h.2v.3h-.1c-.1 0-.1-.2 0-.2");
    			add_location(path485, file$c, 1811, 1, 88948);
    			attr_dev(path486, "fill", "none");
    			attr_dev(path486, "stroke", "#000");
    			attr_dev(path486, "stroke-width", ".1");
    			attr_dev(path486, "d", "M235.4 224h.2v.3h-.1c-.1 0-.1-.2 0-.2z");
    			add_location(path486, file$c, 1812, 1, 89000);
    			attr_dev(path487, "d", "m236.3 224.8-.3-.2v-.2h.1l.4.3.3.2v.2h-.2l-.3-.3");
    			add_location(path487, file$c, 1813, 1, 89097);
    			attr_dev(path488, "fill", "none");
    			attr_dev(path488, "stroke", "#000");
    			attr_dev(path488, "stroke-width", ".1");
    			attr_dev(path488, "d", "m236.3 224.8-.3-.2v-.2h.1l.4.3.3.2v.2h-.2l-.3-.3");
    			add_location(path488, file$c, 1814, 1, 89160);
    			attr_dev(path489, "d", "m234.6 223.7-.2-.2s-.1 0 0-.1l.3.1.3.1v.2h-.1l-.3-.1");
    			add_location(path489, file$c, 1815, 1, 89267);
    			attr_dev(path490, "fill", "none");
    			attr_dev(path490, "stroke", "#000");
    			attr_dev(path490, "stroke-width", ".1");
    			attr_dev(path490, "d", "m234.6 223.7-.2-.2s-.1 0 0-.1l.3.1.3.1v.2h-.1l-.3-.1");
    			add_location(path490, file$c, 1816, 1, 89334);
    			attr_dev(path491, "d", "M233.7 223h.2v.2h-.2s-.1-.1 0-.2");
    			add_location(path491, file$c, 1822, 1, 89454);
    			attr_dev(path492, "fill", "none");
    			attr_dev(path492, "stroke", "#000");
    			attr_dev(path492, "stroke-width", ".1");
    			attr_dev(path492, "d", "M233.7 223h.2v.2h-.2s-.1-.1 0-.2z");
    			add_location(path492, file$c, 1823, 1, 89501);
    			attr_dev(path493, "d", "M237.3 225.5v-.2h-.3l.1.2h.2");
    			add_location(path493, file$c, 1824, 1, 89593);
    			attr_dev(path494, "fill", "none");
    			attr_dev(path494, "stroke", "#000");
    			attr_dev(path494, "stroke-width", ".1");
    			attr_dev(path494, "d", "M237.3 225.5v-.2h-.3l.1.2h.2z");
    			add_location(path494, file$c, 1825, 1, 89636);
    			attr_dev(path495, "d", "m237.9 226.2.2.2h.1c.1 0 0-.1 0-.2l-.2-.2-.2-.2h-.1v.2l.2.2");
    			add_location(path495, file$c, 1826, 1, 89724);
    			attr_dev(path496, "fill", "none");
    			attr_dev(path496, "stroke", "#000");
    			attr_dev(path496, "stroke-width", ".1");
    			attr_dev(path496, "d", "m237.9 226.2.2.2h.1c.1 0 0-.1 0-.2l-.2-.2-.2-.2h-.1v.2l.2.2");
    			add_location(path496, file$c, 1827, 1, 89798);
    			attr_dev(path497, "d", "M238.8 227v-.3h-.3v.2h.3");
    			add_location(path497, file$c, 1833, 1, 89925);
    			attr_dev(path498, "fill", "none");
    			attr_dev(path498, "stroke", "#000");
    			attr_dev(path498, "stroke-width", ".1");
    			attr_dev(path498, "d", "M238.8 227v-.3h-.3v.2h.3z");
    			add_location(path498, file$c, 1834, 1, 89964);
    			attr_dev(path499, "fill", "#c8b100");
    			attr_dev(path499, "d", "M236.2 221.1h-.6l-.1.9v.1h.2l.7-.5-.3-.5");
    			add_location(path499, file$c, 1835, 1, 90048);
    			attr_dev(path500, "fill", "none");
    			attr_dev(path500, "stroke", "#000");
    			attr_dev(path500, "stroke-width", ".3");
    			attr_dev(path500, "d", "M236.2 221.1h-.6l-.1.9v.1h.2l.7-.5-.3-.5");
    			add_location(path500, file$c, 1836, 1, 90118);
    			attr_dev(path501, "fill", "#c8b100");
    			attr_dev(path501, "d", "M234.6 221.6v.5l.9.1h.1v-.2l-.5-.7-.5.3");
    			add_location(path501, file$c, 1837, 1, 90217);
    			attr_dev(path502, "fill", "none");
    			attr_dev(path502, "stroke", "#000");
    			attr_dev(path502, "stroke-width", ".3");
    			attr_dev(path502, "d", "M234.6 221.6v.5l.9.1h.1v-.2l-.5-.7-.5.3");
    			add_location(path502, file$c, 1838, 1, 90286);
    			attr_dev(path503, "fill", "#c8b100");
    			attr_dev(path503, "d", "m236.4 222.6-.4.3-.6-.7v-.1h1.1v.5");
    			add_location(path503, file$c, 1839, 1, 90384);
    			attr_dev(path504, "fill", "none");
    			attr_dev(path504, "stroke", "#000");
    			attr_dev(path504, "stroke-width", ".3");
    			attr_dev(path504, "d", "m236.4 222.6-.4.3-.6-.7v-.1h1.1v.5");
    			add_location(path504, file$c, 1840, 1, 90448);
    			attr_dev(path505, "fill", "#c8b100");
    			attr_dev(path505, "d", "M235.3 222a.3.3 0 0 1 .4 0 .3.3 0 0 1 0 .3.3.3 0 0 1-.3 0 .3.3 0 0 1-.1-.3");
    			add_location(path505, file$c, 1841, 1, 90541);
    			attr_dev(path506, "fill", "none");
    			attr_dev(path506, "stroke", "#000");
    			attr_dev(path506, "stroke-width", ".3");
    			attr_dev(path506, "d", "M235.3 222a.3.3 0 0 1 .4 0 .3.3 0 0 1 0 .3.3.3 0 0 1-.3 0 .3.3 0 0 1-.1-.3z");
    			add_location(path506, file$c, 1842, 1, 90645);
    			attr_dev(path507, "fill", "#c8b100");
    			attr_dev(path507, "d", "m233.2 221.1-.2-.7-.4-.4s.4-.2.8.1c.4.3 0 .9 0 .9l-.2.1");
    			add_location(path507, file$c, 1848, 1, 90788);
    			attr_dev(path508, "fill", "none");
    			attr_dev(path508, "stroke", "#000");
    			attr_dev(path508, "stroke-width", ".3");
    			attr_dev(path508, "d", "m233.2 221.1-.2-.7-.4-.4s.4-.2.8.1c.4.3 0 .9 0 .9l-.2.1z");
    			add_location(path508, file$c, 1849, 1, 90873);
    			attr_dev(path509, "fill", "#c8b100");
    			attr_dev(path509, "d", "m234.2 221.4-.4.4-.6-.6v-.2h1v.4");
    			add_location(path509, file$c, 1855, 1, 90997);
    			attr_dev(path510, "fill", "none");
    			attr_dev(path510, "stroke", "#000");
    			attr_dev(path510, "stroke-width", ".3");
    			attr_dev(path510, "d", "m234.2 221.4-.4.4-.6-.6v-.2h1v.4");
    			add_location(path510, file$c, 1856, 1, 91059);
    			attr_dev(path511, "fill", "#c8b100");
    			attr_dev(path511, "d", "m233.1 221 .3-.1v.3c0 .2-.1.2-.2.2l-.1-.3");
    			add_location(path511, file$c, 1857, 1, 91150);
    			attr_dev(path512, "fill", "none");
    			attr_dev(path512, "stroke", "#000");
    			attr_dev(path512, "stroke-width", ".3");
    			attr_dev(path512, "d", "m233.1 221 .3-.1v.3c0 .2-.1.2-.2.2l-.1-.3z");
    			add_location(path512, file$c, 1858, 1, 91221);
    			attr_dev(path513, "fill", "#c8b100");
    			attr_dev(path513, "d", "M238.3 222.5h-.5l-.3.7v.2h.2l.8-.4-.2-.5");
    			add_location(path513, file$c, 1859, 1, 91322);
    			attr_dev(path514, "fill", "none");
    			attr_dev(path514, "stroke", "#000");
    			attr_dev(path514, "stroke-width", ".3");
    			attr_dev(path514, "d", "M238.3 222.5h-.5l-.3.7v.2h.2l.8-.4-.2-.5");
    			add_location(path514, file$c, 1860, 1, 91392);
    			attr_dev(path515, "fill", "#c8b100");
    			attr_dev(path515, "d", "M236.7 222.8v.5l.8.2h.1v-.2l-.4-.7-.5.2");
    			add_location(path515, file$c, 1861, 1, 91491);
    			attr_dev(path516, "fill", "none");
    			attr_dev(path516, "stroke", "#000");
    			attr_dev(path516, "stroke-width", ".3");
    			attr_dev(path516, "d", "M236.7 222.8v.5l.8.2h.1v-.2l-.4-.7-.5.2");
    			add_location(path516, file$c, 1862, 1, 91560);
    			attr_dev(path517, "fill", "#c8b100");
    			attr_dev(path517, "d", "m238.4 224-.5.2-.4-.7v-.2h.1l.9.2-.1.5");
    			add_location(path517, file$c, 1863, 1, 91658);
    			attr_dev(path518, "fill", "none");
    			attr_dev(path518, "stroke", "#000");
    			attr_dev(path518, "stroke-width", ".3");
    			attr_dev(path518, "d", "m238.4 224-.5.2-.4-.7v-.2h.1l.9.2-.1.5");
    			add_location(path518, file$c, 1864, 1, 91726);
    			attr_dev(path519, "fill", "#c8b100");
    			attr_dev(path519, "d", "M237.3 223.2h.4a.3.3 0 0 1 0 .4.3.3 0 0 1-.3 0 .3.3 0 0 1 0-.4");
    			add_location(path519, file$c, 1865, 1, 91823);
    			attr_dev(path520, "fill", "none");
    			attr_dev(path520, "stroke", "#000");
    			attr_dev(path520, "stroke-width", ".3");
    			attr_dev(path520, "d", "M237.3 223.2h.4a.3.3 0 0 1 0 .4.3.3 0 0 1-.3 0 .3.3 0 0 1 0-.4z");
    			add_location(path520, file$c, 1866, 1, 91915);
    			attr_dev(path521, "fill", "#c8b100");
    			attr_dev(path521, "d", "m240.2 224.3.1.5-.8.3h-.2v-.2l.4-.8.5.2");
    			add_location(path521, file$c, 1872, 1, 92046);
    			attr_dev(path522, "fill", "none");
    			attr_dev(path522, "stroke", "#000");
    			attr_dev(path522, "stroke-width", ".3");
    			attr_dev(path522, "d", "m240.2 224.3.1.5-.8.3h-.2v-.2l.4-.8.5.2");
    			add_location(path522, file$c, 1873, 1, 92115);
    			attr_dev(path523, "fill", "#c8b100");
    			attr_dev(path523, "d", "m240 225.8-.5.1-.3-.8v-.1h.2l.8.3-.1.5");
    			add_location(path523, file$c, 1874, 1, 92213);
    			attr_dev(path524, "fill", "none");
    			attr_dev(path524, "stroke", "#000");
    			attr_dev(path524, "stroke-width", ".3");
    			attr_dev(path524, "d", "m240 225.8-.5.1-.3-.8v-.1h.2l.8.3-.1.5");
    			add_location(path524, file$c, 1875, 1, 92281);
    			attr_dev(path525, "fill", "#c8b100");
    			attr_dev(path525, "d", "m238.6 224.3-.2.5.9.3h.1v-.1l-.3-.8-.5.1");
    			add_location(path525, file$c, 1876, 1, 92378);
    			attr_dev(path526, "fill", "none");
    			attr_dev(path526, "stroke", "#000");
    			attr_dev(path526, "stroke-width", ".3");
    			attr_dev(path526, "d", "m238.6 224.3-.2.5.9.3h.1v-.1l-.3-.8-.5.1");
    			add_location(path526, file$c, 1877, 1, 92448);
    			attr_dev(path527, "fill", "#c8b100");
    			attr_dev(path527, "d", "M239.5 225.2a.3.3 0 0 0 0-.3.3.3 0 0 0-.4 0 .3.3 0 0 0 0 .3.3.3 0 0 0 .4 0");
    			add_location(path527, file$c, 1878, 1, 92547);
    			attr_dev(path528, "fill", "none");
    			attr_dev(path528, "stroke", "#000");
    			attr_dev(path528, "stroke-width", ".3");
    			attr_dev(path528, "d", "M239.5 225.2a.3.3 0 0 0 0-.3.3.3 0 0 0-.4 0 .3.3 0 0 0 0 .3.3.3 0 0 0 .4 0z");
    			add_location(path528, file$c, 1879, 1, 92651);
    			attr_dev(path529, "fill", "#c8b100");
    			attr_dev(path529, "d", "M240.8 227h.8l.5.3s.1-.4-.3-.7c-.3-.3-.8.2-.8.2l-.2.2");
    			add_location(path529, file$c, 1885, 1, 92794);
    			attr_dev(path530, "fill", "none");
    			attr_dev(path530, "stroke", "#000");
    			attr_dev(path530, "stroke-width", ".3");
    			attr_dev(path530, "d", "M240.8 227h.8l.5.3s.1-.4-.3-.7c-.3-.3-.8.2-.8.2l-.2.2z");
    			add_location(path530, file$c, 1886, 1, 92877);
    			attr_dev(path531, "fill", "#c8b100");
    			attr_dev(path531, "d", "m240.3 226.1-.3.5.8.5v-.1h.2l-.1-1-.6.1");
    			add_location(path531, file$c, 1892, 1, 92999);
    			attr_dev(path532, "fill", "none");
    			attr_dev(path532, "stroke", "#000");
    			attr_dev(path532, "stroke-width", ".3");
    			attr_dev(path532, "d", "m240.3 226.1-.3.5.8.5v-.1h.2l-.1-1-.6.1");
    			add_location(path532, file$c, 1893, 1, 93068);
    			attr_dev(path533, "fill", "#c8b100");
    			attr_dev(path533, "d", "M241 227s.1-.1 0-.2h-.3c-.2 0-.2.1-.1.2h.3");
    			add_location(path533, file$c, 1894, 1, 93166);
    			attr_dev(path534, "fill", "none");
    			attr_dev(path534, "stroke", "#000");
    			attr_dev(path534, "stroke-width", ".3");
    			attr_dev(path534, "d", "M241 227s.1-.1 0-.2h-.3c-.2 0-.2.1-.1.2h.3zm38-21.9v.6h-2.4v-.6h1v-1.3h-.7v-.5h.6v-.6h.6v.6h.6v.6h-.6v1.2h1");
    			add_location(path534, file$c, 1895, 1, 93238);
    			attr_dev(path535, "fill", "none");
    			attr_dev(path535, "d", "M134.4 217.1v-1.2m-.4 1.2v-1.2m-.2 1.2v-1.2m-.3 1.2v-1.2");
    			add_location(path535, file$c, 1901, 1, 93413);
    			attr_dev(path536, "fill", "none");
    			attr_dev(path536, "stroke", "#000");
    			attr_dev(path536, "stroke-width", ".1");
    			attr_dev(path536, "d", "M133.2 217.1v-1.2m-.5 1.1v-1m.2 1v-1m-.7 1v-1m.2 1v-1m-.9 1v-1m.2 1v-1m.3 1v-1m-.7 1v-1m-.3.9v-.8m-.1.8v-.8m-.5.7v-.6m.2.6v-.6m-.4.5v-.5m-.2.5v-.4m-.3.3v-.3m-.3.3v-.2");
    			add_location(path536, file$c, 1902, 1, 93496);
    			attr_dev(path537, "fill", "none");
    			attr_dev(path537, "stroke", "#000");
    			attr_dev(path537, "stroke-width", ".2");
    			attr_dev(path537, "d", "M129.2 216.6v-.2");
    			add_location(path537, file$c, 1908, 1, 93730);
    			attr_dev(path538, "fill", "none");
    			attr_dev(path538, "d", "M135.7 217v-1m-.5 1v-1m-.4 1.2V216m143 1.1V216m-.4 1.1V216m-.3 1.1V216m-.3 1.2V216");
    			add_location(path538, file$c, 1909, 1, 93805);
    			attr_dev(path539, "fill", "none");
    			attr_dev(path539, "stroke", "#000");
    			attr_dev(path539, "stroke-width", ".1");
    			attr_dev(path539, "d", "M276.6 217.1V216m-.6 1v-1m.3 1v-1m-.8 1v-1m.3 1v-1m-.9 1v-1m.2 1v-1m.2 1v-1m-.6 1v-1m-.3.9v-.8m-.2.8v-.8m-.4.7v-.6m.2.6v-.6m-.5.6v-.6m-.2.5v-.4m-.3.4v-.4m-.2.3v-.2");
    			add_location(path539, file$c, 1910, 1, 93914);
    			attr_dev(path540, "fill", "none");
    			attr_dev(path540, "stroke", "#000");
    			attr_dev(path540, "stroke-width", ".2");
    			attr_dev(path540, "d", "M272.6 216.6v-.2");
    			add_location(path540, file$c, 1916, 1, 94145);
    			attr_dev(path541, "fill", "none");
    			attr_dev(path541, "d", "M279.1 217v-1m-.6 1v-1m-.4 1.1V216");
    			add_location(path541, file$c, 1917, 1, 94220);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "id", "flag-icons-es");
    			attr_dev(svg, "viewBox", "0 0 640 480");
    			attr_dev(svg, "class", svg_class_value = /*$$props*/ ctx[0].class);
    			add_location(svg, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, path8);
    			append_dev(svg, path9);
    			append_dev(svg, path10);
    			append_dev(svg, path11);
    			append_dev(svg, path12);
    			append_dev(svg, path13);
    			append_dev(svg, path14);
    			append_dev(svg, path15);
    			append_dev(svg, path16);
    			append_dev(svg, path17);
    			append_dev(svg, path18);
    			append_dev(svg, path19);
    			append_dev(svg, path20);
    			append_dev(svg, path21);
    			append_dev(svg, path22);
    			append_dev(svg, path23);
    			append_dev(svg, path24);
    			append_dev(svg, path25);
    			append_dev(svg, path26);
    			append_dev(svg, path27);
    			append_dev(svg, path28);
    			append_dev(svg, path29);
    			append_dev(svg, path30);
    			append_dev(svg, path31);
    			append_dev(svg, path32);
    			append_dev(svg, path33);
    			append_dev(svg, path34);
    			append_dev(svg, path35);
    			append_dev(svg, path36);
    			append_dev(svg, path37);
    			append_dev(svg, path38);
    			append_dev(svg, path39);
    			append_dev(svg, path40);
    			append_dev(svg, path41);
    			append_dev(svg, path42);
    			append_dev(svg, path43);
    			append_dev(svg, path44);
    			append_dev(svg, path45);
    			append_dev(svg, path46);
    			append_dev(svg, path47);
    			append_dev(svg, path48);
    			append_dev(svg, path49);
    			append_dev(svg, path50);
    			append_dev(svg, path51);
    			append_dev(svg, path52);
    			append_dev(svg, path53);
    			append_dev(svg, path54);
    			append_dev(svg, path55);
    			append_dev(svg, path56);
    			append_dev(svg, path57);
    			append_dev(svg, path58);
    			append_dev(svg, path59);
    			append_dev(svg, path60);
    			append_dev(svg, path61);
    			append_dev(svg, path62);
    			append_dev(svg, path63);
    			append_dev(svg, path64);
    			append_dev(svg, path65);
    			append_dev(svg, path66);
    			append_dev(svg, path67);
    			append_dev(svg, path68);
    			append_dev(svg, path69);
    			append_dev(svg, path70);
    			append_dev(svg, path71);
    			append_dev(svg, path72);
    			append_dev(svg, path73);
    			append_dev(svg, path74);
    			append_dev(svg, path75);
    			append_dev(svg, path76);
    			append_dev(svg, path77);
    			append_dev(svg, path78);
    			append_dev(svg, path79);
    			append_dev(svg, path80);
    			append_dev(svg, path81);
    			append_dev(svg, path82);
    			append_dev(svg, path83);
    			append_dev(svg, path84);
    			append_dev(svg, path85);
    			append_dev(svg, path86);
    			append_dev(svg, path87);
    			append_dev(svg, path88);
    			append_dev(svg, path89);
    			append_dev(svg, path90);
    			append_dev(svg, path91);
    			append_dev(svg, path92);
    			append_dev(svg, path93);
    			append_dev(svg, path94);
    			append_dev(svg, path95);
    			append_dev(svg, path96);
    			append_dev(svg, path97);
    			append_dev(svg, path98);
    			append_dev(svg, path99);
    			append_dev(svg, path100);
    			append_dev(svg, path101);
    			append_dev(svg, path102);
    			append_dev(svg, path103);
    			append_dev(svg, path104);
    			append_dev(svg, path105);
    			append_dev(svg, path106);
    			append_dev(svg, path107);
    			append_dev(svg, path108);
    			append_dev(svg, path109);
    			append_dev(svg, path110);
    			append_dev(svg, path111);
    			append_dev(svg, path112);
    			append_dev(svg, path113);
    			append_dev(svg, path114);
    			append_dev(svg, path115);
    			append_dev(svg, path116);
    			append_dev(svg, path117);
    			append_dev(svg, path118);
    			append_dev(svg, path119);
    			append_dev(svg, path120);
    			append_dev(svg, path121);
    			append_dev(svg, path122);
    			append_dev(svg, path123);
    			append_dev(svg, path124);
    			append_dev(svg, path125);
    			append_dev(svg, path126);
    			append_dev(svg, path127);
    			append_dev(svg, path128);
    			append_dev(svg, path129);
    			append_dev(svg, path130);
    			append_dev(svg, path131);
    			append_dev(svg, path132);
    			append_dev(svg, path133);
    			append_dev(svg, path134);
    			append_dev(svg, path135);
    			append_dev(svg, path136);
    			append_dev(svg, path137);
    			append_dev(svg, path138);
    			append_dev(svg, path139);
    			append_dev(svg, path140);
    			append_dev(svg, path141);
    			append_dev(svg, path142);
    			append_dev(svg, path143);
    			append_dev(svg, path144);
    			append_dev(svg, path145);
    			append_dev(svg, path146);
    			append_dev(svg, path147);
    			append_dev(svg, path148);
    			append_dev(svg, path149);
    			append_dev(svg, path150);
    			append_dev(svg, path151);
    			append_dev(svg, path152);
    			append_dev(svg, path153);
    			append_dev(svg, path154);
    			append_dev(svg, path155);
    			append_dev(svg, path156);
    			append_dev(svg, path157);
    			append_dev(svg, path158);
    			append_dev(svg, path159);
    			append_dev(svg, path160);
    			append_dev(svg, path161);
    			append_dev(svg, path162);
    			append_dev(svg, path163);
    			append_dev(svg, path164);
    			append_dev(svg, path165);
    			append_dev(svg, path166);
    			append_dev(svg, path167);
    			append_dev(svg, path168);
    			append_dev(svg, path169);
    			append_dev(svg, path170);
    			append_dev(svg, path171);
    			append_dev(svg, path172);
    			append_dev(svg, path173);
    			append_dev(svg, path174);
    			append_dev(svg, path175);
    			append_dev(svg, path176);
    			append_dev(svg, path177);
    			append_dev(svg, path178);
    			append_dev(svg, path179);
    			append_dev(svg, path180);
    			append_dev(svg, path181);
    			append_dev(svg, path182);
    			append_dev(svg, path183);
    			append_dev(svg, path184);
    			append_dev(svg, path185);
    			append_dev(svg, path186);
    			append_dev(svg, path187);
    			append_dev(svg, path188);
    			append_dev(svg, path189);
    			append_dev(svg, path190);
    			append_dev(svg, path191);
    			append_dev(svg, path192);
    			append_dev(svg, path193);
    			append_dev(svg, path194);
    			append_dev(svg, path195);
    			append_dev(svg, path196);
    			append_dev(svg, path197);
    			append_dev(svg, path198);
    			append_dev(svg, path199);
    			append_dev(svg, path200);
    			append_dev(svg, path201);
    			append_dev(svg, path202);
    			append_dev(svg, path203);
    			append_dev(svg, path204);
    			append_dev(svg, path205);
    			append_dev(svg, path206);
    			append_dev(svg, path207);
    			append_dev(svg, path208);
    			append_dev(svg, path209);
    			append_dev(svg, path210);
    			append_dev(svg, path211);
    			append_dev(svg, path212);
    			append_dev(svg, path213);
    			append_dev(svg, path214);
    			append_dev(svg, path215);
    			append_dev(svg, path216);
    			append_dev(svg, path217);
    			append_dev(svg, path218);
    			append_dev(svg, path219);
    			append_dev(svg, path220);
    			append_dev(svg, path221);
    			append_dev(svg, path222);
    			append_dev(svg, path223);
    			append_dev(svg, path224);
    			append_dev(svg, path225);
    			append_dev(svg, path226);
    			append_dev(svg, path227);
    			append_dev(svg, path228);
    			append_dev(svg, path229);
    			append_dev(svg, path230);
    			append_dev(svg, path231);
    			append_dev(svg, path232);
    			append_dev(svg, path233);
    			append_dev(svg, path234);
    			append_dev(svg, path235);
    			append_dev(svg, path236);
    			append_dev(svg, path237);
    			append_dev(svg, path238);
    			append_dev(svg, path239);
    			append_dev(svg, path240);
    			append_dev(svg, path241);
    			append_dev(svg, path242);
    			append_dev(svg, path243);
    			append_dev(svg, path244);
    			append_dev(svg, path245);
    			append_dev(svg, path246);
    			append_dev(svg, path247);
    			append_dev(svg, path248);
    			append_dev(svg, path249);
    			append_dev(svg, path250);
    			append_dev(svg, path251);
    			append_dev(svg, path252);
    			append_dev(svg, path253);
    			append_dev(svg, path254);
    			append_dev(svg, path255);
    			append_dev(svg, path256);
    			append_dev(svg, path257);
    			append_dev(svg, path258);
    			append_dev(svg, path259);
    			append_dev(svg, path260);
    			append_dev(svg, path261);
    			append_dev(svg, path262);
    			append_dev(svg, path263);
    			append_dev(svg, path264);
    			append_dev(svg, path265);
    			append_dev(svg, path266);
    			append_dev(svg, path267);
    			append_dev(svg, path268);
    			append_dev(svg, path269);
    			append_dev(svg, path270);
    			append_dev(svg, path271);
    			append_dev(svg, path272);
    			append_dev(svg, path273);
    			append_dev(svg, path274);
    			append_dev(svg, path275);
    			append_dev(svg, path276);
    			append_dev(svg, path277);
    			append_dev(svg, path278);
    			append_dev(svg, path279);
    			append_dev(svg, path280);
    			append_dev(svg, path281);
    			append_dev(svg, path282);
    			append_dev(svg, path283);
    			append_dev(svg, path284);
    			append_dev(svg, path285);
    			append_dev(svg, path286);
    			append_dev(svg, path287);
    			append_dev(svg, path288);
    			append_dev(svg, path289);
    			append_dev(svg, path290);
    			append_dev(svg, path291);
    			append_dev(svg, path292);
    			append_dev(svg, path293);
    			append_dev(svg, path294);
    			append_dev(svg, path295);
    			append_dev(svg, path296);
    			append_dev(svg, path297);
    			append_dev(svg, path298);
    			append_dev(svg, path299);
    			append_dev(svg, path300);
    			append_dev(svg, path301);
    			append_dev(svg, path302);
    			append_dev(svg, path303);
    			append_dev(svg, path304);
    			append_dev(svg, path305);
    			append_dev(svg, path306);
    			append_dev(svg, path307);
    			append_dev(svg, path308);
    			append_dev(svg, path309);
    			append_dev(svg, path310);
    			append_dev(svg, path311);
    			append_dev(svg, path312);
    			append_dev(svg, path313);
    			append_dev(svg, path314);
    			append_dev(svg, path315);
    			append_dev(svg, path316);
    			append_dev(svg, path317);
    			append_dev(svg, path318);
    			append_dev(svg, path319);
    			append_dev(svg, path320);
    			append_dev(svg, path321);
    			append_dev(svg, path322);
    			append_dev(svg, path323);
    			append_dev(svg, path324);
    			append_dev(svg, path325);
    			append_dev(svg, path326);
    			append_dev(svg, path327);
    			append_dev(svg, path328);
    			append_dev(svg, path329);
    			append_dev(svg, path330);
    			append_dev(svg, path331);
    			append_dev(svg, path332);
    			append_dev(svg, path333);
    			append_dev(svg, path334);
    			append_dev(svg, path335);
    			append_dev(svg, path336);
    			append_dev(svg, path337);
    			append_dev(svg, path338);
    			append_dev(svg, path339);
    			append_dev(svg, path340);
    			append_dev(svg, path341);
    			append_dev(svg, path342);
    			append_dev(svg, path343);
    			append_dev(svg, path344);
    			append_dev(svg, path345);
    			append_dev(svg, path346);
    			append_dev(svg, path347);
    			append_dev(svg, path348);
    			append_dev(svg, path349);
    			append_dev(svg, path350);
    			append_dev(svg, path351);
    			append_dev(svg, path352);
    			append_dev(svg, path353);
    			append_dev(svg, path354);
    			append_dev(svg, path355);
    			append_dev(svg, path356);
    			append_dev(svg, path357);
    			append_dev(svg, path358);
    			append_dev(svg, path359);
    			append_dev(svg, path360);
    			append_dev(svg, path361);
    			append_dev(svg, path362);
    			append_dev(svg, path363);
    			append_dev(svg, path364);
    			append_dev(svg, path365);
    			append_dev(svg, path366);
    			append_dev(svg, path367);
    			append_dev(svg, path368);
    			append_dev(svg, path369);
    			append_dev(svg, path370);
    			append_dev(svg, path371);
    			append_dev(svg, path372);
    			append_dev(svg, path373);
    			append_dev(svg, path374);
    			append_dev(svg, path375);
    			append_dev(svg, path376);
    			append_dev(svg, path377);
    			append_dev(svg, path378);
    			append_dev(svg, path379);
    			append_dev(svg, path380);
    			append_dev(svg, path381);
    			append_dev(svg, path382);
    			append_dev(svg, path383);
    			append_dev(svg, path384);
    			append_dev(svg, path385);
    			append_dev(svg, path386);
    			append_dev(svg, path387);
    			append_dev(svg, path388);
    			append_dev(svg, path389);
    			append_dev(svg, path390);
    			append_dev(svg, path391);
    			append_dev(svg, path392);
    			append_dev(svg, path393);
    			append_dev(svg, path394);
    			append_dev(svg, path395);
    			append_dev(svg, path396);
    			append_dev(svg, path397);
    			append_dev(svg, path398);
    			append_dev(svg, path399);
    			append_dev(svg, path400);
    			append_dev(svg, path401);
    			append_dev(svg, path402);
    			append_dev(svg, path403);
    			append_dev(svg, path404);
    			append_dev(svg, path405);
    			append_dev(svg, path406);
    			append_dev(svg, path407);
    			append_dev(svg, path408);
    			append_dev(svg, path409);
    			append_dev(svg, path410);
    			append_dev(svg, path411);
    			append_dev(svg, path412);
    			append_dev(svg, path413);
    			append_dev(svg, path414);
    			append_dev(svg, path415);
    			append_dev(svg, path416);
    			append_dev(svg, path417);
    			append_dev(svg, path418);
    			append_dev(svg, path419);
    			append_dev(svg, path420);
    			append_dev(svg, path421);
    			append_dev(svg, path422);
    			append_dev(svg, path423);
    			append_dev(svg, path424);
    			append_dev(svg, path425);
    			append_dev(svg, path426);
    			append_dev(svg, path427);
    			append_dev(svg, path428);
    			append_dev(svg, path429);
    			append_dev(svg, path430);
    			append_dev(svg, path431);
    			append_dev(svg, path432);
    			append_dev(svg, path433);
    			append_dev(svg, path434);
    			append_dev(svg, path435);
    			append_dev(svg, path436);
    			append_dev(svg, path437);
    			append_dev(svg, path438);
    			append_dev(svg, path439);
    			append_dev(svg, path440);
    			append_dev(svg, path441);
    			append_dev(svg, path442);
    			append_dev(svg, path443);
    			append_dev(svg, path444);
    			append_dev(svg, path445);
    			append_dev(svg, path446);
    			append_dev(svg, path447);
    			append_dev(svg, path448);
    			append_dev(svg, path449);
    			append_dev(svg, path450);
    			append_dev(svg, path451);
    			append_dev(svg, path452);
    			append_dev(svg, path453);
    			append_dev(svg, path454);
    			append_dev(svg, path455);
    			append_dev(svg, path456);
    			append_dev(svg, path457);
    			append_dev(svg, path458);
    			append_dev(svg, path459);
    			append_dev(svg, path460);
    			append_dev(svg, path461);
    			append_dev(svg, path462);
    			append_dev(svg, path463);
    			append_dev(svg, path464);
    			append_dev(svg, path465);
    			append_dev(svg, path466);
    			append_dev(svg, path467);
    			append_dev(svg, path468);
    			append_dev(svg, path469);
    			append_dev(svg, path470);
    			append_dev(svg, path471);
    			append_dev(svg, path472);
    			append_dev(svg, path473);
    			append_dev(svg, path474);
    			append_dev(svg, path475);
    			append_dev(svg, path476);
    			append_dev(svg, path477);
    			append_dev(svg, path478);
    			append_dev(svg, path479);
    			append_dev(svg, path480);
    			append_dev(svg, path481);
    			append_dev(svg, path482);
    			append_dev(svg, path483);
    			append_dev(svg, path484);
    			append_dev(svg, path485);
    			append_dev(svg, path486);
    			append_dev(svg, path487);
    			append_dev(svg, path488);
    			append_dev(svg, path489);
    			append_dev(svg, path490);
    			append_dev(svg, path491);
    			append_dev(svg, path492);
    			append_dev(svg, path493);
    			append_dev(svg, path494);
    			append_dev(svg, path495);
    			append_dev(svg, path496);
    			append_dev(svg, path497);
    			append_dev(svg, path498);
    			append_dev(svg, path499);
    			append_dev(svg, path500);
    			append_dev(svg, path501);
    			append_dev(svg, path502);
    			append_dev(svg, path503);
    			append_dev(svg, path504);
    			append_dev(svg, path505);
    			append_dev(svg, path506);
    			append_dev(svg, path507);
    			append_dev(svg, path508);
    			append_dev(svg, path509);
    			append_dev(svg, path510);
    			append_dev(svg, path511);
    			append_dev(svg, path512);
    			append_dev(svg, path513);
    			append_dev(svg, path514);
    			append_dev(svg, path515);
    			append_dev(svg, path516);
    			append_dev(svg, path517);
    			append_dev(svg, path518);
    			append_dev(svg, path519);
    			append_dev(svg, path520);
    			append_dev(svg, path521);
    			append_dev(svg, path522);
    			append_dev(svg, path523);
    			append_dev(svg, path524);
    			append_dev(svg, path525);
    			append_dev(svg, path526);
    			append_dev(svg, path527);
    			append_dev(svg, path528);
    			append_dev(svg, path529);
    			append_dev(svg, path530);
    			append_dev(svg, path531);
    			append_dev(svg, path532);
    			append_dev(svg, path533);
    			append_dev(svg, path534);
    			append_dev(svg, path535);
    			append_dev(svg, path536);
    			append_dev(svg, path537);
    			append_dev(svg, path538);
    			append_dev(svg, path539);
    			append_dev(svg, path540);
    			append_dev(svg, path541);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$props*/ 1 && svg_class_value !== (svg_class_value = /*$$props*/ ctx[0].class)) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Es', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Es extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Es",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\shared\components\flags\id.svelte generated by Svelte v3.55.0 */

    const file$b = "src\\shared\\components\\flags\\id.svelte";

    function create_fragment$h(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill", "#e70011");
    			attr_dev(path0, "d", "M0 0h640v240H0z");
    			add_location(path0, file$b, 1, 1, 86);
    			attr_dev(path1, "fill", "#fff");
    			attr_dev(path1, "d", "M0 240h640v240H0z");
    			add_location(path1, file$b, 2, 1, 131);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 640 480");
    			attr_dev(svg, "class", svg_class_value = /*$$props*/ ctx[0].class);
    			add_location(svg, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$props*/ 1 && svg_class_value !== (svg_class_value = /*$$props*/ ctx[0].class)) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Id', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Id extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Id",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /*
        ADDING A NEW LANGUAGE TO CPUVS:
        1) Add the ISO 639-1 code of the language to the SUPPORTED_LANGUAGES array in this file
        2) Add a file named "<ISO 639-1 code>.svelte" under src/shared/components/flags/.
            This file should contain the 4x3 svg flag of the country representing the language.
            The flag should be sourced from https://github.com/lipis/flag-icons/tree/main/flags/4x3.
            The attribute "class={$$props.class}" should be added to the svg root element of such file
            (see the other .svelte files in that folder for reference).
        3) Import this new "<ISO 639-1 code>.svelte" file into src/shared/components/selects/LanguageSelect.svelte
            Inside LanguageSelect.svelte there should be a map object named
            "flags", add to it a new entry where a string containing the ISO 639-1 code is mapped to the
            flag's svelte component.
        4) Add a file named "<ISO 639-1 code>.yaml" to public/resources/i18n/app/ containing all the
            translations for the simulator (see other files in this directory for reference)
        5) Add a file named "<ISO 639-1 code>.yaml" to public/resources/i18n/manual/ containing all the
            translations for the simulator's manual (see other files in this directory for reference)
        6) Translate eventual messages inside .env/develop/resources/messages.yaml and .env/main/resources/messages.yaml
    */
    const SUPPORTED_LANGUAGES = ["en", "it", "es", "id"];
    const DEFAULT_LANGUAGE = "en";
    function getDefaultLanguage() {
        let lang = navigator.languages !== undefined ? navigator.languages[0] : navigator.language;
        lang = lang.split("-")[0];
        return SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
    }

    /* src\shared\components\selects\LanguageSelect.svelte generated by Svelte v3.55.0 */

    const { Map: Map_1 } = globals;

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (18:1) <ListboxButton>
    function create_default_slot_3$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*flags*/ ctx[1].get(/*value*/ ctx[0]);

    	function switch_props(ctx) {
    		return {
    			props: { class: "w-12 h-7" },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*flags*/ ctx[1].get(/*value*/ ctx[0]))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
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
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(18:1) <ListboxButton>",
    		ctx
    	});

    	return block;
    }

    // (26:3) <ListboxOption value={language}>
    function create_default_slot_2$4(ctx) {
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*flags*/ ctx[1].get(/*language*/ ctx[4]);

    	function switch_props(ctx) {
    		return {
    			props: {
    				class: "w-12 h-7 cursor-pointer shadow-md"
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*flags*/ ctx[1].get(/*language*/ ctx[4]))) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, t.parentNode, t);
    				} else {
    					switch_instance = null;
    				}
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
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(26:3) <ListboxOption value={language}>",
    		ctx
    	});

    	return block;
    }

    // (25:2) {#each SUPPORTED_LANGUAGES as language (language)}
    function create_each_block$4(key_1, ctx) {
    	let first;
    	let listboxoption;
    	let current;

    	listboxoption = new ListboxOption({
    			props: {
    				value: /*language*/ ctx[4],
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(listboxoption.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(listboxoption, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const listboxoption_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				listboxoption_changes.$$scope = { dirty, ctx };
    			}

    			listboxoption.$set(listboxoption_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listboxoption.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listboxoption.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(listboxoption, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(25:2) {#each SUPPORTED_LANGUAGES as language (language)}",
    		ctx
    	});

    	return block;
    }

    // (21:1) <ListboxOptions   class="absolute flex flex-col gap-1 py-2 px-1 overflow-y-auto overflow-x-hidden max-h-28 z-10 rounded-md shadow-md"   style="background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.3);"  >
    function create_default_slot_1$4(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map_1();
    	let each_1_anchor;
    	let current;
    	let each_value = SUPPORTED_LANGUAGES;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*language*/ ctx[4];
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*SUPPORTED_LANGUAGES, flags*/ 2) {
    				each_value = SUPPORTED_LANGUAGES;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$4, each_1_anchor, get_each_context$4);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(21:1) <ListboxOptions   class=\\\"absolute flex flex-col gap-1 py-2 px-1 overflow-y-auto overflow-x-hidden max-h-28 z-10 rounded-md shadow-md\\\"   style=\\\"background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.3);\\\"  >",
    		ctx
    	});

    	return block;
    }

    // (17:0) <Listbox bind:value on:change={e => (value = e.detail)}>
    function create_default_slot$b(ctx) {
    	let listboxbutton;
    	let t;
    	let listboxoptions;
    	let current;

    	listboxbutton = new ListboxButton({
    			props: {
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listboxoptions = new ListboxOptions({
    			props: {
    				class: "absolute flex flex-col gap-1 py-2 px-1 overflow-y-auto overflow-x-hidden max-h-28 z-10 rounded-md shadow-md",
    				style: "background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.3);",
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listboxbutton.$$.fragment);
    			t = space();
    			create_component(listboxoptions.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listboxbutton, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(listboxoptions, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listboxbutton_changes = {};

    			if (dirty & /*$$scope, value*/ 129) {
    				listboxbutton_changes.$$scope = { dirty, ctx };
    			}

    			listboxbutton.$set(listboxbutton_changes);
    			const listboxoptions_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				listboxoptions_changes.$$scope = { dirty, ctx };
    			}

    			listboxoptions.$set(listboxoptions_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listboxbutton.$$.fragment, local);
    			transition_in(listboxoptions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listboxbutton.$$.fragment, local);
    			transition_out(listboxoptions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listboxbutton, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(listboxoptions, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(17:0) <Listbox bind:value on:change={e => (value = e.detail)}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let listbox;
    	let updating_value;
    	let current;

    	function listbox_value_binding(value) {
    		/*listbox_value_binding*/ ctx[2](value);
    	}

    	let listbox_props = {
    		$$slots: { default: [create_default_slot$b] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		listbox_props.value = /*value*/ ctx[0];
    	}

    	listbox = new Listbox({ props: listbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(listbox, 'value', listbox_value_binding, /*value*/ ctx[0]));
    	listbox.$on("change", /*change_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(listbox.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(listbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const listbox_changes = {};

    			if (dirty & /*$$scope, value*/ 129) {
    				listbox_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				listbox_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			listbox.$set(listbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LanguageSelect', slots, []);
    	let { value } = $$props;
    	const flags = new Map([["en", En], ["it", It], ["es", Es], ["id", Id]]);

    	$$self.$$.on_mount.push(function () {
    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<LanguageSelect> was created without expected prop 'value'");
    		}
    	});

    	const writable_props = ['value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LanguageSelect> was created with unknown prop '${key}'`);
    	});

    	function listbox_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	const change_handler = e => $$invalidate(0, value = e.detail);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		Listbox,
    		ListboxButton,
    		ListboxOptions,
    		ListboxOption,
    		It,
    		En,
    		Es,
    		Id,
    		SUPPORTED_LANGUAGES,
    		value,
    		flags
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, flags, listbox_value_binding, change_handler];
    }

    class LanguageSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$g, create_fragment$g, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LanguageSelect",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get value() {
    		throw new Error("<LanguageSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<LanguageSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class LocalStorage {
        constructor(namespace) {
            this.namespace = namespace;
        }
        set(key, value) {
            localStorage.setItem(`${this.namespace}.${key.toString()}`, value.toString());
        }
        get(key) {
            return localStorage.getItem(`${this.namespace}.${key.toString()}`);
        }
        getOrElse(key, orElse) {
            return this.isSet(key) ? this.get(key) : orElse.toString();
        }
        isSet(key) {
            return localStorage.getItem(`${this.namespace}.${key.toString()}`) !== null;
        }
    }

    const storage = new LocalStorage("manual");

    const language = writable();
    const defaults = {
        language: getDefaultLanguage()
    };
    function init$1() {
        language.set(storage.getOrElse("language", defaults.language));
        language.subscribe(newValue => storage.set("language", newValue));
    }

    const ALIAS = Symbol.for('yaml.alias');
    const DOC = Symbol.for('yaml.document');
    const MAP = Symbol.for('yaml.map');
    const PAIR = Symbol.for('yaml.pair');
    const SCALAR$1 = Symbol.for('yaml.scalar');
    const SEQ = Symbol.for('yaml.seq');
    const NODE_TYPE = Symbol.for('yaml.node.type');
    const isAlias = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === ALIAS;
    const isDocument = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === DOC;
    const isMap = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === MAP;
    const isPair = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === PAIR;
    const isScalar = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SCALAR$1;
    const isSeq = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
        if (node && typeof node === 'object')
            switch (node[NODE_TYPE]) {
                case MAP:
                case SEQ:
                    return true;
            }
        return false;
    }
    function isNode(node) {
        if (node && typeof node === 'object')
            switch (node[NODE_TYPE]) {
                case ALIAS:
                case MAP:
                case SCALAR$1:
                case SEQ:
                    return true;
            }
        return false;
    }
    const hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    class NodeBase {
        constructor(type) {
            Object.defineProperty(this, NODE_TYPE, { value: type });
        }
        /** Create a copy of this node.  */
        clone() {
            const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
            if (this.range)
                copy.range = this.range.slice();
            return copy;
        }
    }

    const BREAK = Symbol('break visit');
    const SKIP = Symbol('skip children');
    const REMOVE = Symbol('remove node');
    /**
     * Apply a visitor to an AST node or document.
     *
     * Walks through the tree (depth-first) starting from `node`, calling a
     * `visitor` function with three arguments:
     *   - `key`: For sequence values and map `Pair`, the node's index in the
     *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
     *     `null` for the root node.
     *   - `node`: The current node.
     *   - `path`: The ancestry of the current node.
     *
     * The return value of the visitor may be used to control the traversal:
     *   - `undefined` (default): Do nothing and continue
     *   - `visit.SKIP`: Do not visit the children of this node, continue with next
     *     sibling
     *   - `visit.BREAK`: Terminate traversal completely
     *   - `visit.REMOVE`: Remove the current node, then continue with the next one
     *   - `Node`: Replace the current node, then continue by visiting it
     *   - `number`: While iterating the items of a sequence or map, set the index
     *     of the next step. This is useful especially if the index of the current
     *     node has changed.
     *
     * If `visitor` is a single function, it will be called with all values
     * encountered in the tree, including e.g. `null` values. Alternatively,
     * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
     * `Alias` and `Scalar` node. To define the same visitor function for more than
     * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
     * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
     * specific defined one will be used for each node.
     */
    function visit(node, visitor) {
        const visitor_ = initVisitor(visitor);
        if (isDocument(node)) {
            const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
            if (cd === REMOVE)
                node.contents = null;
        }
        else
            visit_(null, node, visitor_, Object.freeze([]));
    }
    // Without the `as symbol` casts, TS declares these in the `visit`
    // namespace using `var`, but then complains about that because
    // `unique symbol` must be `const`.
    /** Terminate visit traversal completely */
    visit.BREAK = BREAK;
    /** Do not visit the children of the current node */
    visit.SKIP = SKIP;
    /** Remove the current node */
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path) {
        const ctrl = callVisitor(key, node, visitor, path);
        if (isNode(ctrl) || isPair(ctrl)) {
            replaceNode(key, path, ctrl);
            return visit_(key, ctrl, visitor, path);
        }
        if (typeof ctrl !== 'symbol') {
            if (isCollection(node)) {
                path = Object.freeze(path.concat(node));
                for (let i = 0; i < node.items.length; ++i) {
                    const ci = visit_(i, node.items[i], visitor, path);
                    if (typeof ci === 'number')
                        i = ci - 1;
                    else if (ci === BREAK)
                        return BREAK;
                    else if (ci === REMOVE) {
                        node.items.splice(i, 1);
                        i -= 1;
                    }
                }
            }
            else if (isPair(node)) {
                path = Object.freeze(path.concat(node));
                const ck = visit_('key', node.key, visitor, path);
                if (ck === BREAK)
                    return BREAK;
                else if (ck === REMOVE)
                    node.key = null;
                const cv = visit_('value', node.value, visitor, path);
                if (cv === BREAK)
                    return BREAK;
                else if (cv === REMOVE)
                    node.value = null;
            }
        }
        return ctrl;
    }
    function initVisitor(visitor) {
        if (typeof visitor === 'object' &&
            (visitor.Collection || visitor.Node || visitor.Value)) {
            return Object.assign({
                Alias: visitor.Node,
                Map: visitor.Node,
                Scalar: visitor.Node,
                Seq: visitor.Node
            }, visitor.Value && {
                Map: visitor.Value,
                Scalar: visitor.Value,
                Seq: visitor.Value
            }, visitor.Collection && {
                Map: visitor.Collection,
                Seq: visitor.Collection
            }, visitor);
        }
        return visitor;
    }
    function callVisitor(key, node, visitor, path) {
        if (typeof visitor === 'function')
            return visitor(key, node, path);
        if (isMap(node))
            return visitor.Map?.(key, node, path);
        if (isSeq(node))
            return visitor.Seq?.(key, node, path);
        if (isPair(node))
            return visitor.Pair?.(key, node, path);
        if (isScalar(node))
            return visitor.Scalar?.(key, node, path);
        if (isAlias(node))
            return visitor.Alias?.(key, node, path);
        return undefined;
    }
    function replaceNode(key, path, node) {
        const parent = path[path.length - 1];
        if (isCollection(parent)) {
            parent.items[key] = node;
        }
        else if (isPair(parent)) {
            if (key === 'key')
                parent.key = node;
            else
                parent.value = node;
        }
        else if (isDocument(parent)) {
            parent.contents = node;
        }
        else {
            const pt = isAlias(parent) ? 'alias' : 'scalar';
            throw new Error(`Cannot replace node with ${pt} parent`);
        }
    }

    const escapeChars = {
        '!': '%21',
        ',': '%2C',
        '[': '%5B',
        ']': '%5D',
        '{': '%7B',
        '}': '%7D'
    };
    const escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, ch => escapeChars[ch]);
    class Directives {
        constructor(yaml, tags) {
            /**
             * The directives-end/doc-start marker `---`. If `null`, a marker may still be
             * included in the document's stringified representation.
             */
            this.docStart = null;
            /** The doc-end marker `...`.  */
            this.docEnd = false;
            this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
            this.tags = Object.assign({}, Directives.defaultTags, tags);
        }
        clone() {
            const copy = new Directives(this.yaml, this.tags);
            copy.docStart = this.docStart;
            return copy;
        }
        /**
         * During parsing, get a Directives instance for the current document and
         * update the stream state according to the current version's spec.
         */
        atDocument() {
            const res = new Directives(this.yaml, this.tags);
            switch (this.yaml.version) {
                case '1.1':
                    this.atNextDocument = true;
                    break;
                case '1.2':
                    this.atNextDocument = false;
                    this.yaml = {
                        explicit: Directives.defaultYaml.explicit,
                        version: '1.2'
                    };
                    this.tags = Object.assign({}, Directives.defaultTags);
                    break;
            }
            return res;
        }
        /**
         * @param onError - May be called even if the action was successful
         * @returns `true` on success
         */
        add(line, onError) {
            if (this.atNextDocument) {
                this.yaml = { explicit: Directives.defaultYaml.explicit, version: '1.1' };
                this.tags = Object.assign({}, Directives.defaultTags);
                this.atNextDocument = false;
            }
            const parts = line.trim().split(/[ \t]+/);
            const name = parts.shift();
            switch (name) {
                case '%TAG': {
                    if (parts.length !== 2) {
                        onError(0, '%TAG directive should contain exactly two parts');
                        if (parts.length < 2)
                            return false;
                    }
                    const [handle, prefix] = parts;
                    this.tags[handle] = prefix;
                    return true;
                }
                case '%YAML': {
                    this.yaml.explicit = true;
                    if (parts.length !== 1) {
                        onError(0, '%YAML directive should contain exactly one part');
                        return false;
                    }
                    const [version] = parts;
                    if (version === '1.1' || version === '1.2') {
                        this.yaml.version = version;
                        return true;
                    }
                    else {
                        const isValid = /^\d+\.\d+$/.test(version);
                        onError(6, `Unsupported YAML version ${version}`, isValid);
                        return false;
                    }
                }
                default:
                    onError(0, `Unknown directive ${name}`, true);
                    return false;
            }
        }
        /**
         * Resolves a tag, matching handles to those defined in %TAG directives.
         *
         * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
         *   `'!local'` tag, or `null` if unresolvable.
         */
        tagName(source, onError) {
            if (source === '!')
                return '!'; // non-specific tag
            if (source[0] !== '!') {
                onError(`Not a valid tag: ${source}`);
                return null;
            }
            if (source[1] === '<') {
                const verbatim = source.slice(2, -1);
                if (verbatim === '!' || verbatim === '!!') {
                    onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
                    return null;
                }
                if (source[source.length - 1] !== '>')
                    onError('Verbatim tags must end with a >');
                return verbatim;
            }
            const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/);
            if (!suffix)
                onError(`The ${source} tag has no suffix`);
            const prefix = this.tags[handle];
            if (prefix)
                return prefix + decodeURIComponent(suffix);
            if (handle === '!')
                return source; // local tag
            onError(`Could not resolve tag: ${source}`);
            return null;
        }
        /**
         * Given a fully resolved tag, returns its printable string form,
         * taking into account current tag prefixes and defaults.
         */
        tagString(tag) {
            for (const [handle, prefix] of Object.entries(this.tags)) {
                if (tag.startsWith(prefix))
                    return handle + escapeTagName(tag.substring(prefix.length));
            }
            return tag[0] === '!' ? tag : `!<${tag}>`;
        }
        toString(doc) {
            const lines = this.yaml.explicit
                ? [`%YAML ${this.yaml.version || '1.2'}`]
                : [];
            const tagEntries = Object.entries(this.tags);
            let tagNames;
            if (doc && tagEntries.length > 0 && isNode(doc.contents)) {
                const tags = {};
                visit(doc.contents, (_key, node) => {
                    if (isNode(node) && node.tag)
                        tags[node.tag] = true;
                });
                tagNames = Object.keys(tags);
            }
            else
                tagNames = [];
            for (const [handle, prefix] of tagEntries) {
                if (handle === '!!' && prefix === 'tag:yaml.org,2002:')
                    continue;
                if (!doc || tagNames.some(tn => tn.startsWith(prefix)))
                    lines.push(`%TAG ${handle} ${prefix}`);
            }
            return lines.join('\n');
        }
    }
    Directives.defaultYaml = { explicit: false, version: '1.2' };
    Directives.defaultTags = { '!!': 'tag:yaml.org,2002:' };

    /**
     * Verify that the input string is a valid anchor.
     *
     * Will throw on errors.
     */
    function anchorIsValid(anchor) {
        if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
            const sa = JSON.stringify(anchor);
            const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
            throw new Error(msg);
        }
        return true;
    }
    function anchorNames(root) {
        const anchors = new Set();
        visit(root, {
            Value(_key, node) {
                if (node.anchor)
                    anchors.add(node.anchor);
            }
        });
        return anchors;
    }
    /** Find a new anchor name with the given `prefix` and a one-indexed suffix. */
    function findNewAnchor(prefix, exclude) {
        for (let i = 1; true; ++i) {
            const name = `${prefix}${i}`;
            if (!exclude.has(name))
                return name;
        }
    }
    function createNodeAnchors(doc, prefix) {
        const aliasObjects = [];
        const sourceObjects = new Map();
        let prevAnchors = null;
        return {
            onAnchor: (source) => {
                aliasObjects.push(source);
                if (!prevAnchors)
                    prevAnchors = anchorNames(doc);
                const anchor = findNewAnchor(prefix, prevAnchors);
                prevAnchors.add(anchor);
                return anchor;
            },
            /**
             * With circular references, the source node is only resolved after all
             * of its child nodes are. This is why anchors are set only after all of
             * the nodes have been created.
             */
            setAnchors: () => {
                for (const source of aliasObjects) {
                    const ref = sourceObjects.get(source);
                    if (typeof ref === 'object' &&
                        ref.anchor &&
                        (isScalar(ref.node) || isCollection(ref.node))) {
                        ref.node.anchor = ref.anchor;
                    }
                    else {
                        const error = new Error('Failed to resolve repeated object (this should not happen)');
                        error.source = source;
                        throw error;
                    }
                }
            },
            sourceObjects
        };
    }

    class Alias extends NodeBase {
        constructor(source) {
            super(ALIAS);
            this.source = source;
            Object.defineProperty(this, 'tag', {
                set() {
                    throw new Error('Alias nodes cannot have tags');
                }
            });
        }
        /**
         * Resolve the value of this alias within `doc`, finding the last
         * instance of the `source` anchor before this node.
         */
        resolve(doc) {
            let found = undefined;
            visit(doc, {
                Node: (_key, node) => {
                    if (node === this)
                        return visit.BREAK;
                    if (node.anchor === this.source)
                        found = node;
                }
            });
            return found;
        }
        toJSON(_arg, ctx) {
            if (!ctx)
                return { source: this.source };
            const { anchors, doc, maxAliasCount } = ctx;
            const source = this.resolve(doc);
            if (!source) {
                const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
                throw new ReferenceError(msg);
            }
            const data = anchors.get(source);
            /* istanbul ignore if */
            if (!data || data.res === undefined) {
                const msg = 'This should not happen: Alias anchor was not resolved?';
                throw new ReferenceError(msg);
            }
            if (maxAliasCount >= 0) {
                data.count += 1;
                if (data.aliasCount === 0)
                    data.aliasCount = getAliasCount(doc, source, anchors);
                if (data.count * data.aliasCount > maxAliasCount) {
                    const msg = 'Excessive alias count indicates a resource exhaustion attack';
                    throw new ReferenceError(msg);
                }
            }
            return data.res;
        }
        toString(ctx, _onComment, _onChompKeep) {
            const src = `*${this.source}`;
            if (ctx) {
                anchorIsValid(this.source);
                if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
                    const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
                    throw new Error(msg);
                }
                if (ctx.implicitKey)
                    return `${src} `;
            }
            return src;
        }
    }
    function getAliasCount(doc, node, anchors) {
        if (isAlias(node)) {
            const source = node.resolve(doc);
            const anchor = anchors && source && anchors.get(source);
            return anchor ? anchor.count * anchor.aliasCount : 0;
        }
        else if (isCollection(node)) {
            let count = 0;
            for (const item of node.items) {
                const c = getAliasCount(doc, item, anchors);
                if (c > count)
                    count = c;
            }
            return count;
        }
        else if (isPair(node)) {
            const kc = getAliasCount(doc, node.key, anchors);
            const vc = getAliasCount(doc, node.value, anchors);
            return Math.max(kc, vc);
        }
        return 1;
    }

    /**
     * Recursively convert any node or its contents to native JavaScript
     *
     * @param value - The input value
     * @param arg - If `value` defines a `toJSON()` method, use this
     *   as its first argument
     * @param ctx - Conversion context, originally set in Document#toJS(). If
     *   `{ keep: true }` is not set, output should be suitable for JSON
     *   stringification.
     */
    function toJS(value, arg, ctx) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (Array.isArray(value))
            return value.map((v, i) => toJS(v, String(i), ctx));
        if (value && typeof value.toJSON === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            if (!ctx || !hasAnchor(value))
                return value.toJSON(arg, ctx);
            const data = { aliasCount: 0, count: 1, res: undefined };
            ctx.anchors.set(value, data);
            ctx.onCreate = res => {
                data.res = res;
                delete ctx.onCreate;
            };
            const res = value.toJSON(arg, ctx);
            if (ctx.onCreate)
                ctx.onCreate(res);
            return res;
        }
        if (typeof value === 'bigint' && !ctx?.keep)
            return Number(value);
        return value;
    }

    const isScalarValue = (value) => !value || (typeof value !== 'function' && typeof value !== 'object');
    class Scalar extends NodeBase {
        constructor(value) {
            super(SCALAR$1);
            this.value = value;
        }
        toJSON(arg, ctx) {
            return ctx?.keep ? this.value : toJS(this.value, arg, ctx);
        }
        toString() {
            return String(this.value);
        }
    }
    Scalar.BLOCK_FOLDED = 'BLOCK_FOLDED';
    Scalar.BLOCK_LITERAL = 'BLOCK_LITERAL';
    Scalar.PLAIN = 'PLAIN';
    Scalar.QUOTE_DOUBLE = 'QUOTE_DOUBLE';
    Scalar.QUOTE_SINGLE = 'QUOTE_SINGLE';

    const defaultTagPrefix = 'tag:yaml.org,2002:';
    function findTagObject(value, tagName, tags) {
        if (tagName) {
            const match = tags.filter(t => t.tag === tagName);
            const tagObj = match.find(t => !t.format) ?? match[0];
            if (!tagObj)
                throw new Error(`Tag ${tagName} not found`);
            return tagObj;
        }
        return tags.find(t => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
        if (isDocument(value))
            value = value.contents;
        if (isNode(value))
            return value;
        if (isPair(value)) {
            const map = ctx.schema[MAP].createNode?.(ctx.schema, null, ctx);
            map.items.push(value);
            return map;
        }
        if (value instanceof String ||
            value instanceof Number ||
            value instanceof Boolean ||
            (typeof BigInt !== 'undefined' && value instanceof BigInt) // not supported everywhere
        ) {
            // https://tc39.es/ecma262/#sec-serializejsonproperty
            value = value.valueOf();
        }
        const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
        // Detect duplicate references to the same object & use Alias nodes for all
        // after first. The `ref` wrapper allows for circular references to resolve.
        let ref = undefined;
        if (aliasDuplicateObjects && value && typeof value === 'object') {
            ref = sourceObjects.get(value);
            if (ref) {
                if (!ref.anchor)
                    ref.anchor = onAnchor(value);
                return new Alias(ref.anchor);
            }
            else {
                ref = { anchor: null, node: null };
                sourceObjects.set(value, ref);
            }
        }
        if (tagName?.startsWith('!!'))
            tagName = defaultTagPrefix + tagName.slice(2);
        let tagObj = findTagObject(value, tagName, schema.tags);
        if (!tagObj) {
            if (value && typeof value.toJSON === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                value = value.toJSON();
            }
            if (!value || typeof value !== 'object') {
                const node = new Scalar(value);
                if (ref)
                    ref.node = node;
                return node;
            }
            tagObj =
                value instanceof Map
                    ? schema[MAP]
                    : Symbol.iterator in Object(value)
                        ? schema[SEQ]
                        : schema[MAP];
        }
        if (onTagObj) {
            onTagObj(tagObj);
            delete ctx.onTagObj;
        }
        const node = tagObj?.createNode
            ? tagObj.createNode(ctx.schema, value, ctx)
            : new Scalar(value);
        if (tagName)
            node.tag = tagName;
        if (ref)
            ref.node = node;
        return node;
    }

    function collectionFromPath(schema, path, value) {
        let v = value;
        for (let i = path.length - 1; i >= 0; --i) {
            const k = path[i];
            if (typeof k === 'number' && Number.isInteger(k) && k >= 0) {
                const a = [];
                a[k] = v;
                v = a;
            }
            else {
                v = new Map([[k, v]]);
            }
        }
        return createNode(v, undefined, {
            aliasDuplicateObjects: false,
            keepUndefined: false,
            onAnchor: () => {
                throw new Error('This should not happen, please report a bug.');
            },
            schema,
            sourceObjects: new Map()
        });
    }
    // Type guard is intentionally a little wrong so as to be more useful,
    // as it does not cover untypable empty non-string iterables (e.g. []).
    const isEmptyPath = (path) => path == null ||
        (typeof path === 'object' && !!path[Symbol.iterator]().next().done);
    class Collection extends NodeBase {
        constructor(type, schema) {
            super(type);
            Object.defineProperty(this, 'schema', {
                value: schema,
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
        /**
         * Create a copy of this collection.
         *
         * @param schema - If defined, overwrites the original's schema
         */
        clone(schema) {
            const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
            if (schema)
                copy.schema = schema;
            copy.items = copy.items.map(it => isNode(it) || isPair(it) ? it.clone(schema) : it);
            if (this.range)
                copy.range = this.range.slice();
            return copy;
        }
        /**
         * Adds a value to the collection. For `!!map` and `!!omap` the value must
         * be a Pair instance or a `{ key, value }` object, which may not have a key
         * that already exists in the map.
         */
        addIn(path, value) {
            if (isEmptyPath(path))
                this.add(value);
            else {
                const [key, ...rest] = path;
                const node = this.get(key, true);
                if (isCollection(node))
                    node.addIn(rest, value);
                else if (node === undefined && this.schema)
                    this.set(key, collectionFromPath(this.schema, rest, value));
                else
                    throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
            }
        }
        /**
         * Removes a value from the collection.
         * @returns `true` if the item was found and removed.
         */
        deleteIn(path) {
            const [key, ...rest] = path;
            if (rest.length === 0)
                return this.delete(key);
            const node = this.get(key, true);
            if (isCollection(node))
                return node.deleteIn(rest);
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
        /**
         * Returns item at `key`, or `undefined` if not found. By default unwraps
         * scalar values from their surrounding node; to disable set `keepScalar` to
         * `true` (collections are always returned intact).
         */
        getIn(path, keepScalar) {
            const [key, ...rest] = path;
            const node = this.get(key, true);
            if (rest.length === 0)
                return !keepScalar && isScalar(node) ? node.value : node;
            else
                return isCollection(node) ? node.getIn(rest, keepScalar) : undefined;
        }
        hasAllNullValues(allowScalar) {
            return this.items.every(node => {
                if (!isPair(node))
                    return false;
                const n = node.value;
                return (n == null ||
                    (allowScalar &&
                        isScalar(n) &&
                        n.value == null &&
                        !n.commentBefore &&
                        !n.comment &&
                        !n.tag));
            });
        }
        /**
         * Checks if the collection includes a value with the key `key`.
         */
        hasIn(path) {
            const [key, ...rest] = path;
            if (rest.length === 0)
                return this.has(key);
            const node = this.get(key, true);
            return isCollection(node) ? node.hasIn(rest) : false;
        }
        /**
         * Sets a value in this collection. For `!!set`, `value` needs to be a
         * boolean to add/remove the item from the set.
         */
        setIn(path, value) {
            const [key, ...rest] = path;
            if (rest.length === 0) {
                this.set(key, value);
            }
            else {
                const node = this.get(key, true);
                if (isCollection(node))
                    node.setIn(rest, value);
                else if (node === undefined && this.schema)
                    this.set(key, collectionFromPath(this.schema, rest, value));
                else
                    throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
            }
        }
    }
    Collection.maxFlowStringSingleLineLength = 60;

    /**
     * Stringifies a comment.
     *
     * Empty comment lines are left empty,
     * lines consisting of a single space are replaced by `#`,
     * and all other lines are prefixed with a `#`.
     */
    const stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, '#');
    function indentComment(comment, indent) {
        if (/^\n+$/.test(comment))
            return comment.substring(1);
        return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    const lineComment = (str, indent, comment) => str.endsWith('\n')
        ? indentComment(comment, indent)
        : comment.includes('\n')
            ? '\n' + indentComment(comment, indent)
            : (str.endsWith(' ') ? '' : ' ') + comment;

    const FOLD_FLOW = 'flow';
    const FOLD_BLOCK = 'block';
    const FOLD_QUOTED = 'quoted';
    /**
     * Tries to keep input at up to `lineWidth` characters, splitting only on spaces
     * not followed by newlines or spaces unless `mode` is `'quoted'`. Lines are
     * terminated with `\n` and started with `indent`.
     */
    function foldFlowLines(text, indent, mode = 'flow', { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
        if (!lineWidth || lineWidth < 0)
            return text;
        const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
        if (text.length <= endStep)
            return text;
        const folds = [];
        const escapedFolds = {};
        let end = lineWidth - indent.length;
        if (typeof indentAtStart === 'number') {
            if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
                folds.push(0);
            else
                end = lineWidth - indentAtStart;
        }
        let split = undefined;
        let prev = undefined;
        let overflow = false;
        let i = -1;
        let escStart = -1;
        let escEnd = -1;
        if (mode === FOLD_BLOCK) {
            i = consumeMoreIndentedLines(text, i);
            if (i !== -1)
                end = i + endStep;
        }
        for (let ch; (ch = text[(i += 1)]);) {
            if (mode === FOLD_QUOTED && ch === '\\') {
                escStart = i;
                switch (text[i + 1]) {
                    case 'x':
                        i += 3;
                        break;
                    case 'u':
                        i += 5;
                        break;
                    case 'U':
                        i += 9;
                        break;
                    default:
                        i += 1;
                }
                escEnd = i;
            }
            if (ch === '\n') {
                if (mode === FOLD_BLOCK)
                    i = consumeMoreIndentedLines(text, i);
                end = i + endStep;
                split = undefined;
            }
            else {
                if (ch === ' ' &&
                    prev &&
                    prev !== ' ' &&
                    prev !== '\n' &&
                    prev !== '\t') {
                    // space surrounded by non-space can be replaced with newline + indent
                    const next = text[i + 1];
                    if (next && next !== ' ' && next !== '\n' && next !== '\t')
                        split = i;
                }
                if (i >= end) {
                    if (split) {
                        folds.push(split);
                        end = split + endStep;
                        split = undefined;
                    }
                    else if (mode === FOLD_QUOTED) {
                        // white-space collected at end may stretch past lineWidth
                        while (prev === ' ' || prev === '\t') {
                            prev = ch;
                            ch = text[(i += 1)];
                            overflow = true;
                        }
                        // Account for newline escape, but don't break preceding escape
                        const j = i > escEnd + 1 ? i - 2 : escStart - 1;
                        // Bail out if lineWidth & minContentWidth are shorter than an escape string
                        if (escapedFolds[j])
                            return text;
                        folds.push(j);
                        escapedFolds[j] = true;
                        end = j + endStep;
                        split = undefined;
                    }
                    else {
                        overflow = true;
                    }
                }
            }
            prev = ch;
        }
        if (overflow && onOverflow)
            onOverflow();
        if (folds.length === 0)
            return text;
        if (onFold)
            onFold();
        let res = text.slice(0, folds[0]);
        for (let i = 0; i < folds.length; ++i) {
            const fold = folds[i];
            const end = folds[i + 1] || text.length;
            if (fold === 0)
                res = `\n${indent}${text.slice(0, end)}`;
            else {
                if (mode === FOLD_QUOTED && escapedFolds[fold])
                    res += `${text[fold]}\\`;
                res += `\n${indent}${text.slice(fold + 1, end)}`;
            }
        }
        return res;
    }
    /**
     * Presumes `i + 1` is at the start of a line
     * @returns index of last newline in more-indented block
     */
    function consumeMoreIndentedLines(text, i) {
        let ch = text[i + 1];
        while (ch === ' ' || ch === '\t') {
            do {
                ch = text[(i += 1)];
            } while (ch && ch !== '\n');
            ch = text[i + 1];
        }
        return i;
    }

    const getFoldOptions = (ctx) => ({
        indentAtStart: ctx.indentAtStart,
        lineWidth: ctx.options.lineWidth,
        minContentWidth: ctx.options.minContentWidth
    });
    // Also checks for lines starting with %, as parsing the output as YAML 1.1 will
    // presume that's starting a new document.
    const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
        if (!lineWidth || lineWidth < 0)
            return false;
        const limit = lineWidth - indentLength;
        const strLen = str.length;
        if (strLen <= limit)
            return false;
        for (let i = 0, start = 0; i < strLen; ++i) {
            if (str[i] === '\n') {
                if (i - start > limit)
                    return true;
                start = i + 1;
                if (strLen - start <= limit)
                    return false;
            }
        }
        return true;
    }
    function doubleQuotedString(value, ctx) {
        const json = JSON.stringify(value);
        if (ctx.options.doubleQuotedAsJSON)
            return json;
        const { implicitKey } = ctx;
        const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
        const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
        let str = '';
        let start = 0;
        for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
            if (ch === ' ' && json[i + 1] === '\\' && json[i + 2] === 'n') {
                // space before newline needs to be escaped to not be folded
                str += json.slice(start, i) + '\\ ';
                i += 1;
                start = i;
                ch = '\\';
            }
            if (ch === '\\')
                switch (json[i + 1]) {
                    case 'u':
                        {
                            str += json.slice(start, i);
                            const code = json.substr(i + 2, 4);
                            switch (code) {
                                case '0000':
                                    str += '\\0';
                                    break;
                                case '0007':
                                    str += '\\a';
                                    break;
                                case '000b':
                                    str += '\\v';
                                    break;
                                case '001b':
                                    str += '\\e';
                                    break;
                                case '0085':
                                    str += '\\N';
                                    break;
                                case '00a0':
                                    str += '\\_';
                                    break;
                                case '2028':
                                    str += '\\L';
                                    break;
                                case '2029':
                                    str += '\\P';
                                    break;
                                default:
                                    if (code.substr(0, 2) === '00')
                                        str += '\\x' + code.substr(2);
                                    else
                                        str += json.substr(i, 6);
                            }
                            i += 5;
                            start = i + 1;
                        }
                        break;
                    case 'n':
                        if (implicitKey ||
                            json[i + 2] === '"' ||
                            json.length < minMultiLineLength) {
                            i += 1;
                        }
                        else {
                            // folding will eat first newline
                            str += json.slice(start, i) + '\n\n';
                            while (json[i + 2] === '\\' &&
                                json[i + 3] === 'n' &&
                                json[i + 4] !== '"') {
                                str += '\n';
                                i += 2;
                            }
                            str += indent;
                            // space after newline needs to be escaped to not be folded
                            if (json[i + 2] === ' ')
                                str += '\\';
                            i += 1;
                            start = i + 1;
                        }
                        break;
                    default:
                        i += 1;
                }
        }
        str = start ? str + json.slice(start) : json;
        return implicitKey
            ? str
            : foldFlowLines(str, indent, FOLD_QUOTED, getFoldOptions(ctx));
    }
    function singleQuotedString(value, ctx) {
        if (ctx.options.singleQuote === false ||
            (ctx.implicitKey && value.includes('\n')) ||
            /[ \t]\n|\n[ \t]/.test(value) // single quoted string can't have leading or trailing whitespace around newline
        )
            return doubleQuotedString(value, ctx);
        const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
        const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
        return ctx.implicitKey
            ? res
            : foldFlowLines(res, indent, FOLD_FLOW, getFoldOptions(ctx));
    }
    function quotedString(value, ctx) {
        const { singleQuote } = ctx.options;
        let qs;
        if (singleQuote === false)
            qs = doubleQuotedString;
        else {
            const hasDouble = value.includes('"');
            const hasSingle = value.includes("'");
            if (hasDouble && !hasSingle)
                qs = singleQuotedString;
            else if (hasSingle && !hasDouble)
                qs = doubleQuotedString;
            else
                qs = singleQuote ? singleQuotedString : doubleQuotedString;
        }
        return qs(value, ctx);
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
        const { blockQuote, commentString, lineWidth } = ctx.options;
        // 1. Block can't end in whitespace unless the last line is non-empty.
        // 2. Strings consisting of only whitespace are best rendered explicitly.
        if (!blockQuote || /\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
            return quotedString(value, ctx);
        }
        const indent = ctx.indent ||
            (ctx.forceBlockIndent || containsDocumentMarker(value) ? '  ' : '');
        const literal = blockQuote === 'literal'
            ? true
            : blockQuote === 'folded' || type === Scalar.BLOCK_FOLDED
                ? false
                : type === Scalar.BLOCK_LITERAL
                    ? true
                    : !lineLengthOverLimit(value, lineWidth, indent.length);
        if (!value)
            return literal ? '|\n' : '>\n';
        // determine chomping from whitespace at value end
        let chomp;
        let endStart;
        for (endStart = value.length; endStart > 0; --endStart) {
            const ch = value[endStart - 1];
            if (ch !== '\n' && ch !== '\t' && ch !== ' ')
                break;
        }
        let end = value.substring(endStart);
        const endNlPos = end.indexOf('\n');
        if (endNlPos === -1) {
            chomp = '-'; // strip
        }
        else if (value === end || endNlPos !== end.length - 1) {
            chomp = '+'; // keep
            if (onChompKeep)
                onChompKeep();
        }
        else {
            chomp = ''; // clip
        }
        if (end) {
            value = value.slice(0, -end.length);
            if (end[end.length - 1] === '\n')
                end = end.slice(0, -1);
            end = end.replace(/\n+(?!\n|$)/g, `$&${indent}`);
        }
        // determine indent indicator from whitespace at value start
        let startWithSpace = false;
        let startEnd;
        let startNlPos = -1;
        for (startEnd = 0; startEnd < value.length; ++startEnd) {
            const ch = value[startEnd];
            if (ch === ' ')
                startWithSpace = true;
            else if (ch === '\n')
                startNlPos = startEnd;
            else
                break;
        }
        let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
        if (start) {
            value = value.substring(start.length);
            start = start.replace(/\n+/g, `$&${indent}`);
        }
        const indentSize = indent ? '2' : '1'; // root is at -1
        let header = (literal ? '|' : '>') + (startWithSpace ? indentSize : '') + chomp;
        if (comment) {
            header += ' ' + commentString(comment.replace(/ ?[\r\n]+/g, ' '));
            if (onComment)
                onComment();
        }
        if (literal) {
            value = value.replace(/\n+/g, `$&${indent}`);
            return `${header}\n${indent}${start}${value}${end}`;
        }
        value = value
            .replace(/\n+/g, '\n$&')
            .replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, '$1$2') // more-indented lines aren't folded
            //                ^ more-ind. ^ empty     ^ capture next empty lines only at end of indent
            .replace(/\n+/g, `$&${indent}`);
        const body = foldFlowLines(`${start}${value}${end}`, indent, FOLD_BLOCK, getFoldOptions(ctx));
        return `${header}\n${indent}${body}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
        const { type, value } = item;
        const { actualString, implicitKey, indent, inFlow } = ctx;
        if ((implicitKey && /[\n[\]{},]/.test(value)) ||
            (inFlow && /[[\]{},]/.test(value))) {
            return quotedString(value, ctx);
        }
        if (!value ||
            /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
            // not allowed:
            // - empty string, '-' or '?'
            // - start with an indicator character (except [?:-]) or /[?-] /
            // - '\n ', ': ' or ' \n' anywhere
            // - '#' not preceded by a non-space char
            // - end with ' ' or ':'
            return implicitKey || inFlow || !value.includes('\n')
                ? quotedString(value, ctx)
                : blockString(item, ctx, onComment, onChompKeep);
        }
        if (!implicitKey &&
            !inFlow &&
            type !== Scalar.PLAIN &&
            value.includes('\n')) {
            // Where allowed & type not set explicitly, prefer block style for multiline strings
            return blockString(item, ctx, onComment, onChompKeep);
        }
        if (indent === '' && containsDocumentMarker(value)) {
            ctx.forceBlockIndent = true;
            return blockString(item, ctx, onComment, onChompKeep);
        }
        const str = value.replace(/\n+/g, `$&\n${indent}`);
        // Verify that output will be parsed as a string, as e.g. plain numbers and
        // booleans get parsed with those types in v1.2 (e.g. '42', 'true' & '0.9e-3'),
        // and others in v1.1.
        if (actualString) {
            const test = (tag) => tag.default && tag.tag !== 'tag:yaml.org,2002:str' && tag.test?.test(str);
            const { compat, tags } = ctx.doc.schema;
            if (tags.some(test) || compat?.some(test))
                return quotedString(value, ctx);
        }
        return implicitKey
            ? str
            : foldFlowLines(str, indent, FOLD_FLOW, getFoldOptions(ctx));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
        const { implicitKey, inFlow } = ctx;
        const ss = typeof item.value === 'string'
            ? item
            : Object.assign({}, item, { value: String(item.value) });
        let { type } = item;
        if (type !== Scalar.QUOTE_DOUBLE) {
            // force double quotes on control characters & unpaired surrogates
            if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
                type = Scalar.QUOTE_DOUBLE;
        }
        const _stringify = (_type) => {
            switch (_type) {
                case Scalar.BLOCK_FOLDED:
                case Scalar.BLOCK_LITERAL:
                    return implicitKey || inFlow
                        ? quotedString(ss.value, ctx) // blocks are not valid inside flow containers
                        : blockString(ss, ctx, onComment, onChompKeep);
                case Scalar.QUOTE_DOUBLE:
                    return doubleQuotedString(ss.value, ctx);
                case Scalar.QUOTE_SINGLE:
                    return singleQuotedString(ss.value, ctx);
                case Scalar.PLAIN:
                    return plainString(ss, ctx, onComment, onChompKeep);
                default:
                    return null;
            }
        };
        let res = _stringify(type);
        if (res === null) {
            const { defaultKeyType, defaultStringType } = ctx.options;
            const t = (implicitKey && defaultKeyType) || defaultStringType;
            res = _stringify(t);
            if (res === null)
                throw new Error(`Unsupported default string type ${t}`);
        }
        return res;
    }

    function createStringifyContext(doc, options) {
        const opt = Object.assign({
            blockQuote: true,
            commentString: stringifyComment,
            defaultKeyType: null,
            defaultStringType: 'PLAIN',
            directives: null,
            doubleQuotedAsJSON: false,
            doubleQuotedMinMultiLineLength: 40,
            falseStr: 'false',
            indentSeq: true,
            lineWidth: 80,
            minContentWidth: 20,
            nullStr: 'null',
            simpleKeys: false,
            singleQuote: null,
            trueStr: 'true',
            verifyAliasOrder: true
        }, doc.schema.toStringOptions, options);
        let inFlow;
        switch (opt.collectionStyle) {
            case 'block':
                inFlow = false;
                break;
            case 'flow':
                inFlow = true;
                break;
            default:
                inFlow = null;
        }
        return {
            anchors: new Set(),
            doc,
            indent: '',
            indentStep: typeof opt.indent === 'number' ? ' '.repeat(opt.indent) : '  ',
            inFlow,
            options: opt
        };
    }
    function getTagObject(tags, item) {
        if (item.tag) {
            const match = tags.filter(t => t.tag === item.tag);
            if (match.length > 0)
                return match.find(t => t.format === item.format) ?? match[0];
        }
        let tagObj = undefined;
        let obj;
        if (isScalar(item)) {
            obj = item.value;
            const match = tags.filter(t => t.identify?.(obj));
            tagObj =
                match.find(t => t.format === item.format) ?? match.find(t => !t.format);
        }
        else {
            obj = item;
            tagObj = tags.find(t => t.nodeClass && obj instanceof t.nodeClass);
        }
        if (!tagObj) {
            const name = obj?.constructor?.name ?? typeof obj;
            throw new Error(`Tag not resolved for ${name} value`);
        }
        return tagObj;
    }
    // needs to be called before value stringifier to allow for circular anchor refs
    function stringifyProps(node, tagObj, { anchors, doc }) {
        if (!doc.directives)
            return '';
        const props = [];
        const anchor = (isScalar(node) || isCollection(node)) && node.anchor;
        if (anchor && anchorIsValid(anchor)) {
            anchors.add(anchor);
            props.push(`&${anchor}`);
        }
        const tag = node.tag ? node.tag : tagObj.default ? null : tagObj.tag;
        if (tag)
            props.push(doc.directives.tagString(tag));
        return props.join(' ');
    }
    function stringify(item, ctx, onComment, onChompKeep) {
        if (isPair(item))
            return item.toString(ctx, onComment, onChompKeep);
        if (isAlias(item)) {
            if (ctx.doc.directives)
                return item.toString(ctx);
            if (ctx.resolvedAliases?.has(item)) {
                throw new TypeError(`Cannot stringify circular structure without alias nodes`);
            }
            else {
                if (ctx.resolvedAliases)
                    ctx.resolvedAliases.add(item);
                else
                    ctx.resolvedAliases = new Set([item]);
                item = item.resolve(ctx.doc);
            }
        }
        let tagObj = undefined;
        const node = isNode(item)
            ? item
            : ctx.doc.createNode(item, { onTagObj: o => (tagObj = o) });
        if (!tagObj)
            tagObj = getTagObject(ctx.doc.schema.tags, node);
        const props = stringifyProps(node, tagObj, ctx);
        if (props.length > 0)
            ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
        const str = typeof tagObj.stringify === 'function'
            ? tagObj.stringify(node, ctx, onComment, onChompKeep)
            : isScalar(node)
                ? stringifyString(node, ctx, onComment, onChompKeep)
                : node.toString(ctx, onComment, onChompKeep);
        if (!props)
            return str;
        return isScalar(node) || str[0] === '{' || str[0] === '['
            ? `${props} ${str}`
            : `${props}\n${ctx.indent}${str}`;
    }

    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
        const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
        let keyComment = (isNode(key) && key.comment) || null;
        if (simpleKeys) {
            if (keyComment) {
                throw new Error('With simple keys, key nodes cannot have comments');
            }
            if (isCollection(key)) {
                const msg = 'With simple keys, collection cannot be used as a key value';
                throw new Error(msg);
            }
        }
        let explicitKey = !simpleKeys &&
            (!key ||
                (keyComment && value == null && !ctx.inFlow) ||
                isCollection(key) ||
                (isScalar(key)
                    ? key.type === Scalar.BLOCK_FOLDED || key.type === Scalar.BLOCK_LITERAL
                    : typeof key === 'object'));
        ctx = Object.assign({}, ctx, {
            allNullValues: false,
            implicitKey: !explicitKey && (simpleKeys || !allNullValues),
            indent: indent + indentStep
        });
        let keyCommentDone = false;
        let chompKeep = false;
        let str = stringify(key, ctx, () => (keyCommentDone = true), () => (chompKeep = true));
        if (!explicitKey && !ctx.inFlow && str.length > 1024) {
            if (simpleKeys)
                throw new Error('With simple keys, single line scalar must not span more than 1024 characters');
            explicitKey = true;
        }
        if (ctx.inFlow) {
            if (allNullValues || value == null) {
                if (keyCommentDone && onComment)
                    onComment();
                return str === '' ? '?' : explicitKey ? `? ${str}` : str;
            }
        }
        else if ((allNullValues && !simpleKeys) || (value == null && explicitKey)) {
            str = `? ${str}`;
            if (keyComment && !keyCommentDone) {
                str += lineComment(str, ctx.indent, commentString(keyComment));
            }
            else if (chompKeep && onChompKeep)
                onChompKeep();
            return str;
        }
        if (keyCommentDone)
            keyComment = null;
        if (explicitKey) {
            if (keyComment)
                str += lineComment(str, ctx.indent, commentString(keyComment));
            str = `? ${str}\n${indent}:`;
        }
        else {
            str = `${str}:`;
            if (keyComment)
                str += lineComment(str, ctx.indent, commentString(keyComment));
        }
        let vcb = '';
        let valueComment = null;
        if (isNode(value)) {
            if (value.spaceBefore)
                vcb = '\n';
            if (value.commentBefore) {
                const cs = commentString(value.commentBefore);
                vcb += `\n${indentComment(cs, ctx.indent)}`;
            }
            valueComment = value.comment;
        }
        else if (value && typeof value === 'object') {
            value = doc.createNode(value);
        }
        ctx.implicitKey = false;
        if (!explicitKey && !keyComment && isScalar(value))
            ctx.indentAtStart = str.length + 1;
        chompKeep = false;
        if (!indentSeq &&
            indentStep.length >= 2 &&
            !ctx.inFlow &&
            !explicitKey &&
            isSeq(value) &&
            !value.flow &&
            !value.tag &&
            !value.anchor) {
            // If indentSeq === false, consider '- ' as part of indentation where possible
            ctx.indent = ctx.indent.substr(2);
        }
        let valueCommentDone = false;
        const valueStr = stringify(value, ctx, () => (valueCommentDone = true), () => (chompKeep = true));
        let ws = ' ';
        if (vcb || keyComment) {
            if (valueStr === '' && !ctx.inFlow)
                ws = vcb === '\n' ? '\n\n' : vcb;
            else
                ws = `${vcb}\n${ctx.indent}`;
        }
        else if (!explicitKey && isCollection(value)) {
            const flow = valueStr[0] === '[' || valueStr[0] === '{';
            if (!flow || valueStr.includes('\n'))
                ws = `\n${ctx.indent}`;
        }
        else if (valueStr === '' || valueStr[0] === '\n')
            ws = '';
        str += ws + valueStr;
        if (ctx.inFlow) {
            if (valueCommentDone && onComment)
                onComment();
        }
        else if (valueComment && !valueCommentDone) {
            str += lineComment(str, ctx.indent, commentString(valueComment));
        }
        else if (chompKeep && onChompKeep) {
            onChompKeep();
        }
        return str;
    }

    function warn(logLevel, warning) {
        if (logLevel === 'debug' || logLevel === 'warn') {
            if (typeof process !== 'undefined' && process.emitWarning)
                process.emitWarning(warning);
            else
                console.warn(warning);
        }
    }

    const MERGE_KEY = '<<';
    function addPairToJSMap(ctx, map, { key, value }) {
        if (ctx?.doc.schema.merge && isMergeKey(key)) {
            value = isAlias(value) ? value.resolve(ctx.doc) : value;
            if (isSeq(value))
                for (const it of value.items)
                    mergeToJSMap(ctx, map, it);
            else if (Array.isArray(value))
                for (const it of value)
                    mergeToJSMap(ctx, map, it);
            else
                mergeToJSMap(ctx, map, value);
        }
        else {
            const jsKey = toJS(key, '', ctx);
            if (map instanceof Map) {
                map.set(jsKey, toJS(value, jsKey, ctx));
            }
            else if (map instanceof Set) {
                map.add(jsKey);
            }
            else {
                const stringKey = stringifyKey(key, jsKey, ctx);
                const jsValue = toJS(value, stringKey, ctx);
                if (stringKey in map)
                    Object.defineProperty(map, stringKey, {
                        value: jsValue,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                else
                    map[stringKey] = jsValue;
            }
        }
        return map;
    }
    const isMergeKey = (key) => key === MERGE_KEY ||
        (isScalar(key) &&
            key.value === MERGE_KEY &&
            (!key.type || key.type === Scalar.PLAIN));
    // If the value associated with a merge key is a single mapping node, each of
    // its key/value pairs is inserted into the current mapping, unless the key
    // already exists in it. If the value associated with the merge key is a
    // sequence, then this sequence is expected to contain mapping nodes and each
    // of these nodes is merged in turn according to its order in the sequence.
    // Keys in mapping nodes earlier in the sequence override keys specified in
    // later mapping nodes. -- http://yaml.org/type/merge.html
    function mergeToJSMap(ctx, map, value) {
        const source = ctx && isAlias(value) ? value.resolve(ctx.doc) : value;
        if (!isMap(source))
            throw new Error('Merge sources must be maps or map aliases');
        const srcMap = source.toJSON(null, ctx, Map);
        for (const [key, value] of srcMap) {
            if (map instanceof Map) {
                if (!map.has(key))
                    map.set(key, value);
            }
            else if (map instanceof Set) {
                map.add(key);
            }
            else if (!Object.prototype.hasOwnProperty.call(map, key)) {
                Object.defineProperty(map, key, {
                    value,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            }
        }
        return map;
    }
    function stringifyKey(key, jsKey, ctx) {
        if (jsKey === null)
            return '';
        if (typeof jsKey !== 'object')
            return String(jsKey);
        if (isNode(key) && ctx && ctx.doc) {
            const strCtx = createStringifyContext(ctx.doc, {});
            strCtx.anchors = new Set();
            for (const node of ctx.anchors.keys())
                strCtx.anchors.add(node.anchor);
            strCtx.inFlow = true;
            strCtx.inStringifyKey = true;
            const strKey = key.toString(strCtx);
            if (!ctx.mapKeyWarned) {
                let jsonStr = JSON.stringify(strKey);
                if (jsonStr.length > 40)
                    jsonStr = jsonStr.substring(0, 36) + '..."';
                warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
                ctx.mapKeyWarned = true;
            }
            return strKey;
        }
        return JSON.stringify(jsKey);
    }

    function createPair(key, value, ctx) {
        const k = createNode(key, undefined, ctx);
        const v = createNode(value, undefined, ctx);
        return new Pair(k, v);
    }
    class Pair {
        constructor(key, value = null) {
            Object.defineProperty(this, NODE_TYPE, { value: PAIR });
            this.key = key;
            this.value = value;
        }
        clone(schema) {
            let { key, value } = this;
            if (isNode(key))
                key = key.clone(schema);
            if (isNode(value))
                value = value.clone(schema);
            return new Pair(key, value);
        }
        toJSON(_, ctx) {
            const pair = ctx?.mapAsMap ? new Map() : {};
            return addPairToJSMap(ctx, pair, this);
        }
        toString(ctx, onComment, onChompKeep) {
            return ctx?.doc
                ? stringifyPair(this, ctx, onComment, onChompKeep)
                : JSON.stringify(this);
        }
    }

    function stringifyCollection(collection, ctx, options) {
        const flow = ctx.inFlow ?? collection.flow;
        const stringify = flow ? stringifyFlowCollection : stringifyBlockCollection;
        return stringify(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
        const { indent, options: { commentString } } = ctx;
        const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
        let chompKeep = false; // flag for the preceding node's status
        const lines = [];
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            let comment = null;
            if (isNode(item)) {
                if (!chompKeep && item.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
                if (item.comment)
                    comment = item.comment;
            }
            else if (isPair(item)) {
                const ik = isNode(item.key) ? item.key : null;
                if (ik) {
                    if (!chompKeep && ik.spaceBefore)
                        lines.push('');
                    addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
                }
            }
            chompKeep = false;
            let str = stringify(item, itemCtx, () => (comment = null), () => (chompKeep = true));
            if (comment)
                str += lineComment(str, itemIndent, commentString(comment));
            if (chompKeep && comment)
                chompKeep = false;
            lines.push(blockItemPrefix + str);
        }
        let str;
        if (lines.length === 0) {
            str = flowChars.start + flowChars.end;
        }
        else {
            str = lines[0];
            for (let i = 1; i < lines.length; ++i) {
                const line = lines[i];
                str += line ? `\n${indent}${line}` : '\n';
            }
        }
        if (comment) {
            str += '\n' + indentComment(commentString(comment), indent);
            if (onComment)
                onComment();
        }
        else if (chompKeep && onChompKeep)
            onChompKeep();
        return str;
    }
    function stringifyFlowCollection({ comment, items }, ctx, { flowChars, itemIndent, onComment }) {
        const { indent, indentStep, options: { commentString } } = ctx;
        itemIndent += indentStep;
        const itemCtx = Object.assign({}, ctx, {
            indent: itemIndent,
            inFlow: true,
            type: null
        });
        let reqNewline = false;
        let linesAtValue = 0;
        const lines = [];
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            let comment = null;
            if (isNode(item)) {
                if (item.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, item.commentBefore, false);
                if (item.comment)
                    comment = item.comment;
            }
            else if (isPair(item)) {
                const ik = isNode(item.key) ? item.key : null;
                if (ik) {
                    if (ik.spaceBefore)
                        lines.push('');
                    addCommentBefore(ctx, lines, ik.commentBefore, false);
                    if (ik.comment)
                        reqNewline = true;
                }
                const iv = isNode(item.value) ? item.value : null;
                if (iv) {
                    if (iv.comment)
                        comment = iv.comment;
                    if (iv.commentBefore)
                        reqNewline = true;
                }
                else if (item.value == null && ik && ik.comment) {
                    comment = ik.comment;
                }
            }
            if (comment)
                reqNewline = true;
            let str = stringify(item, itemCtx, () => (comment = null));
            if (i < items.length - 1)
                str += ',';
            if (comment)
                str += lineComment(str, itemIndent, commentString(comment));
            if (!reqNewline && (lines.length > linesAtValue || str.includes('\n')))
                reqNewline = true;
            lines.push(str);
            linesAtValue = lines.length;
        }
        let str;
        const { start, end } = flowChars;
        if (lines.length === 0) {
            str = start + end;
        }
        else {
            if (!reqNewline) {
                const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
                reqNewline = len > Collection.maxFlowStringSingleLineLength;
            }
            if (reqNewline) {
                str = start;
                for (const line of lines)
                    str += line ? `\n${indentStep}${indent}${line}` : '\n';
                str += `\n${indent}${end}`;
            }
            else {
                str = `${start} ${lines.join(' ')} ${end}`;
            }
        }
        if (comment) {
            str += lineComment(str, commentString(comment), indent);
            if (onComment)
                onComment();
        }
        return str;
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
        if (comment && chompKeep)
            comment = comment.replace(/^\n+/, '');
        if (comment) {
            const ic = indentComment(commentString(comment), indent);
            lines.push(ic.trimStart()); // Avoid double indent on first line
        }
    }

    function findPair(items, key) {
        const k = isScalar(key) ? key.value : key;
        for (const it of items) {
            if (isPair(it)) {
                if (it.key === key || it.key === k)
                    return it;
                if (isScalar(it.key) && it.key.value === k)
                    return it;
            }
        }
        return undefined;
    }
    class YAMLMap extends Collection {
        constructor(schema) {
            super(MAP, schema);
            this.items = [];
        }
        static get tagName() {
            return 'tag:yaml.org,2002:map';
        }
        /**
         * Adds a value to the collection.
         *
         * @param overwrite - If not set `true`, using a key that is already in the
         *   collection will throw. Otherwise, overwrites the previous value.
         */
        add(pair, overwrite) {
            let _pair;
            if (isPair(pair))
                _pair = pair;
            else if (!pair || typeof pair !== 'object' || !('key' in pair)) {
                // In TypeScript, this never happens.
                _pair = new Pair(pair, pair?.value);
            }
            else
                _pair = new Pair(pair.key, pair.value);
            const prev = findPair(this.items, _pair.key);
            const sortEntries = this.schema?.sortMapEntries;
            if (prev) {
                if (!overwrite)
                    throw new Error(`Key ${_pair.key} already set`);
                // For scalars, keep the old node & its comments and anchors
                if (isScalar(prev.value) && isScalarValue(_pair.value))
                    prev.value.value = _pair.value;
                else
                    prev.value = _pair.value;
            }
            else if (sortEntries) {
                const i = this.items.findIndex(item => sortEntries(_pair, item) < 0);
                if (i === -1)
                    this.items.push(_pair);
                else
                    this.items.splice(i, 0, _pair);
            }
            else {
                this.items.push(_pair);
            }
        }
        delete(key) {
            const it = findPair(this.items, key);
            if (!it)
                return false;
            const del = this.items.splice(this.items.indexOf(it), 1);
            return del.length > 0;
        }
        get(key, keepScalar) {
            const it = findPair(this.items, key);
            const node = it?.value;
            return (!keepScalar && isScalar(node) ? node.value : node) ?? undefined;
        }
        has(key) {
            return !!findPair(this.items, key);
        }
        set(key, value) {
            this.add(new Pair(key, value), true);
        }
        /**
         * @param ctx - Conversion context, originally set in Document#toJS()
         * @param {Class} Type - If set, forces the returned collection type
         * @returns Instance of Type, Map, or Object
         */
        toJSON(_, ctx, Type) {
            const map = Type ? new Type() : ctx?.mapAsMap ? new Map() : {};
            if (ctx?.onCreate)
                ctx.onCreate(map);
            for (const item of this.items)
                addPairToJSMap(ctx, map, item);
            return map;
        }
        toString(ctx, onComment, onChompKeep) {
            if (!ctx)
                return JSON.stringify(this);
            for (const item of this.items) {
                if (!isPair(item))
                    throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
            }
            if (!ctx.allNullValues && this.hasAllNullValues(false))
                ctx = Object.assign({}, ctx, { allNullValues: true });
            return stringifyCollection(this, ctx, {
                blockItemPrefix: '',
                flowChars: { start: '{', end: '}' },
                itemIndent: ctx.indent || '',
                onChompKeep,
                onComment
            });
        }
    }

    function createMap(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new YAMLMap(schema);
        const add = (key, value) => {
            if (typeof replacer === 'function')
                value = replacer.call(obj, key, value);
            else if (Array.isArray(replacer) && !replacer.includes(key))
                return;
            if (value !== undefined || keepUndefined)
                map.items.push(createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
            for (const [key, value] of obj)
                add(key, value);
        }
        else if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj))
                add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === 'function') {
            map.items.sort(schema.sortMapEntries);
        }
        return map;
    }
    const map = {
        collection: 'map',
        createNode: createMap,
        default: true,
        nodeClass: YAMLMap,
        tag: 'tag:yaml.org,2002:map',
        resolve(map, onError) {
            if (!isMap(map))
                onError('Expected a mapping for this tag');
            return map;
        }
    };

    class YAMLSeq extends Collection {
        constructor(schema) {
            super(SEQ, schema);
            this.items = [];
        }
        static get tagName() {
            return 'tag:yaml.org,2002:seq';
        }
        add(value) {
            this.items.push(value);
        }
        /**
         * Removes a value from the collection.
         *
         * `key` must contain a representation of an integer for this to succeed.
         * It may be wrapped in a `Scalar`.
         *
         * @returns `true` if the item was found and removed.
         */
        delete(key) {
            const idx = asItemIndex(key);
            if (typeof idx !== 'number')
                return false;
            const del = this.items.splice(idx, 1);
            return del.length > 0;
        }
        get(key, keepScalar) {
            const idx = asItemIndex(key);
            if (typeof idx !== 'number')
                return undefined;
            const it = this.items[idx];
            return !keepScalar && isScalar(it) ? it.value : it;
        }
        /**
         * Checks if the collection includes a value with the key `key`.
         *
         * `key` must contain a representation of an integer for this to succeed.
         * It may be wrapped in a `Scalar`.
         */
        has(key) {
            const idx = asItemIndex(key);
            return typeof idx === 'number' && idx < this.items.length;
        }
        /**
         * Sets a value in this collection. For `!!set`, `value` needs to be a
         * boolean to add/remove the item from the set.
         *
         * If `key` does not contain a representation of an integer, this will throw.
         * It may be wrapped in a `Scalar`.
         */
        set(key, value) {
            const idx = asItemIndex(key);
            if (typeof idx !== 'number')
                throw new Error(`Expected a valid index, not ${key}.`);
            const prev = this.items[idx];
            if (isScalar(prev) && isScalarValue(value))
                prev.value = value;
            else
                this.items[idx] = value;
        }
        toJSON(_, ctx) {
            const seq = [];
            if (ctx?.onCreate)
                ctx.onCreate(seq);
            let i = 0;
            for (const item of this.items)
                seq.push(toJS(item, String(i++), ctx));
            return seq;
        }
        toString(ctx, onComment, onChompKeep) {
            if (!ctx)
                return JSON.stringify(this);
            return stringifyCollection(this, ctx, {
                blockItemPrefix: '- ',
                flowChars: { start: '[', end: ']' },
                itemIndent: (ctx.indent || '') + '  ',
                onChompKeep,
                onComment
            });
        }
    }
    function asItemIndex(key) {
        let idx = isScalar(key) ? key.value : key;
        if (idx && typeof idx === 'string')
            idx = Number(idx);
        return typeof idx === 'number' && Number.isInteger(idx) && idx >= 0
            ? idx
            : null;
    }

    function createSeq(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new YAMLSeq(schema);
        if (obj && Symbol.iterator in Object(obj)) {
            let i = 0;
            for (let it of obj) {
                if (typeof replacer === 'function') {
                    const key = obj instanceof Set ? it : String(i++);
                    it = replacer.call(obj, key, it);
                }
                seq.items.push(createNode(it, undefined, ctx));
            }
        }
        return seq;
    }
    const seq = {
        collection: 'seq',
        createNode: createSeq,
        default: true,
        nodeClass: YAMLSeq,
        tag: 'tag:yaml.org,2002:seq',
        resolve(seq, onError) {
            if (!isSeq(seq))
                onError('Expected a sequence for this tag');
            return seq;
        }
    };

    const string = {
        identify: value => typeof value === 'string',
        default: true,
        tag: 'tag:yaml.org,2002:str',
        resolve: str => str,
        stringify(item, ctx, onComment, onChompKeep) {
            ctx = Object.assign({ actualString: true }, ctx);
            return stringifyString(item, ctx, onComment, onChompKeep);
        }
    };

    const nullTag = {
        identify: value => value == null,
        createNode: () => new Scalar(null),
        default: true,
        tag: 'tag:yaml.org,2002:null',
        test: /^(?:~|[Nn]ull|NULL)?$/,
        resolve: () => new Scalar(null),
        stringify: ({ source }, ctx) => typeof source === 'string' && nullTag.test.test(source)
            ? source
            : ctx.options.nullStr
    };

    const boolTag = {
        identify: value => typeof value === 'boolean',
        default: true,
        tag: 'tag:yaml.org,2002:bool',
        test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
        resolve: str => new Scalar(str[0] === 't' || str[0] === 'T'),
        stringify({ source, value }, ctx) {
            if (source && boolTag.test.test(source)) {
                const sv = source[0] === 't' || source[0] === 'T';
                if (value === sv)
                    return source;
            }
            return value ? ctx.options.trueStr : ctx.options.falseStr;
        }
    };

    function stringifyNumber({ format, minFractionDigits, tag, value }) {
        if (typeof value === 'bigint')
            return String(value);
        const num = typeof value === 'number' ? value : Number(value);
        if (!isFinite(num))
            return isNaN(num) ? '.nan' : num < 0 ? '-.inf' : '.inf';
        let n = JSON.stringify(value);
        if (!format &&
            minFractionDigits &&
            (!tag || tag === 'tag:yaml.org,2002:float') &&
            /^\d/.test(n)) {
            let i = n.indexOf('.');
            if (i < 0) {
                i = n.length;
                n += '.';
            }
            let d = minFractionDigits - (n.length - i - 1);
            while (d-- > 0)
                n += '0';
        }
        return n;
    }

    const floatNaN$1 = {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        test: /^(?:[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN))$/,
        resolve: str => str.slice(-3).toLowerCase() === 'nan'
            ? NaN
            : str[0] === '-'
                ? Number.NEGATIVE_INFINITY
                : Number.POSITIVE_INFINITY,
        stringify: stringifyNumber
    };
    const floatExp$1 = {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        format: 'EXP',
        test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
        resolve: str => parseFloat(str),
        stringify(node) {
            const num = Number(node.value);
            return isFinite(num) ? num.toExponential() : stringifyNumber(node);
        }
    };
    const float$1 = {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
        resolve(str) {
            const node = new Scalar(parseFloat(str));
            const dot = str.indexOf('.');
            if (dot !== -1 && str[str.length - 1] === '0')
                node.minFractionDigits = str.length - dot - 1;
            return node;
        },
        stringify: stringifyNumber
    };

    const intIdentify$2 = (value) => typeof value === 'bigint' || Number.isInteger(value);
    const intResolve$1 = (str, offset, radix, { intAsBigInt }) => (intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix));
    function intStringify$1(node, radix, prefix) {
        const { value } = node;
        if (intIdentify$2(value) && value >= 0)
            return prefix + value.toString(radix);
        return stringifyNumber(node);
    }
    const intOct$1 = {
        identify: value => intIdentify$2(value) && value >= 0,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        format: 'OCT',
        test: /^0o[0-7]+$/,
        resolve: (str, _onError, opt) => intResolve$1(str, 2, 8, opt),
        stringify: node => intStringify$1(node, 8, '0o')
    };
    const int$1 = {
        identify: intIdentify$2,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        test: /^[-+]?[0-9]+$/,
        resolve: (str, _onError, opt) => intResolve$1(str, 0, 10, opt),
        stringify: stringifyNumber
    };
    const intHex$1 = {
        identify: value => intIdentify$2(value) && value >= 0,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        format: 'HEX',
        test: /^0x[0-9a-fA-F]+$/,
        resolve: (str, _onError, opt) => intResolve$1(str, 2, 16, opt),
        stringify: node => intStringify$1(node, 16, '0x')
    };

    const schema$2 = [
        map,
        seq,
        string,
        nullTag,
        boolTag,
        intOct$1,
        int$1,
        intHex$1,
        floatNaN$1,
        floatExp$1,
        float$1
    ];

    function intIdentify$1(value) {
        return typeof value === 'bigint' || Number.isInteger(value);
    }
    const stringifyJSON = ({ value }) => JSON.stringify(value);
    const jsonScalars = [
        {
            identify: value => typeof value === 'string',
            default: true,
            tag: 'tag:yaml.org,2002:str',
            resolve: str => str,
            stringify: stringifyJSON
        },
        {
            identify: value => value == null,
            createNode: () => new Scalar(null),
            default: true,
            tag: 'tag:yaml.org,2002:null',
            test: /^null$/,
            resolve: () => null,
            stringify: stringifyJSON
        },
        {
            identify: value => typeof value === 'boolean',
            default: true,
            tag: 'tag:yaml.org,2002:bool',
            test: /^true|false$/,
            resolve: str => str === 'true',
            stringify: stringifyJSON
        },
        {
            identify: intIdentify$1,
            default: true,
            tag: 'tag:yaml.org,2002:int',
            test: /^-?(?:0|[1-9][0-9]*)$/,
            resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
            stringify: ({ value }) => intIdentify$1(value) ? value.toString() : JSON.stringify(value)
        },
        {
            identify: value => typeof value === 'number',
            default: true,
            tag: 'tag:yaml.org,2002:float',
            test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
            resolve: str => parseFloat(str),
            stringify: stringifyJSON
        }
    ];
    const jsonError = {
        default: true,
        tag: '',
        test: /^/,
        resolve(str, onError) {
            onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
            return str;
        }
    };
    const schema$1 = [map, seq].concat(jsonScalars, jsonError);

    const binary = {
        identify: value => value instanceof Uint8Array,
        default: false,
        tag: 'tag:yaml.org,2002:binary',
        /**
         * Returns a Buffer in node and an Uint8Array in browsers
         *
         * To use the resulting buffer as an image, you'll want to do something like:
         *
         *   const blob = new Blob([buffer], { type: 'image/jpeg' })
         *   document.querySelector('#photo').src = URL.createObjectURL(blob)
         */
        resolve(src, onError) {
            if (typeof Buffer === 'function') {
                return Buffer.from(src, 'base64');
            }
            else if (typeof atob === 'function') {
                // On IE 11, atob() can't handle newlines
                const str = atob(src.replace(/[\n\r]/g, ''));
                const buffer = new Uint8Array(str.length);
                for (let i = 0; i < str.length; ++i)
                    buffer[i] = str.charCodeAt(i);
                return buffer;
            }
            else {
                onError('This environment does not support reading binary tags; either Buffer or atob is required');
                return src;
            }
        },
        stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
            const buf = value; // checked earlier by binary.identify()
            let str;
            if (typeof Buffer === 'function') {
                str =
                    buf instanceof Buffer
                        ? buf.toString('base64')
                        : Buffer.from(buf.buffer).toString('base64');
            }
            else if (typeof btoa === 'function') {
                let s = '';
                for (let i = 0; i < buf.length; ++i)
                    s += String.fromCharCode(buf[i]);
                str = btoa(s);
            }
            else {
                throw new Error('This environment does not support writing binary tags; either Buffer or btoa is required');
            }
            if (!type)
                type = Scalar.BLOCK_LITERAL;
            if (type !== Scalar.QUOTE_DOUBLE) {
                const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
                const n = Math.ceil(str.length / lineWidth);
                const lines = new Array(n);
                for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
                    lines[i] = str.substr(o, lineWidth);
                }
                str = lines.join(type === Scalar.BLOCK_LITERAL ? '\n' : ' ');
            }
            return stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
        }
    };

    function resolvePairs(seq, onError) {
        if (isSeq(seq)) {
            for (let i = 0; i < seq.items.length; ++i) {
                let item = seq.items[i];
                if (isPair(item))
                    continue;
                else if (isMap(item)) {
                    if (item.items.length > 1)
                        onError('Each pair must have its own sequence indicator');
                    const pair = item.items[0] || new Pair(new Scalar(null));
                    if (item.commentBefore)
                        pair.key.commentBefore = pair.key.commentBefore
                            ? `${item.commentBefore}\n${pair.key.commentBefore}`
                            : item.commentBefore;
                    if (item.comment) {
                        const cn = pair.value ?? pair.key;
                        cn.comment = cn.comment
                            ? `${item.comment}\n${cn.comment}`
                            : item.comment;
                    }
                    item = pair;
                }
                seq.items[i] = isPair(item) ? item : new Pair(item);
            }
        }
        else
            onError('Expected a sequence for this tag');
        return seq;
    }
    function createPairs(schema, iterable, ctx) {
        const { replacer } = ctx;
        const pairs = new YAMLSeq(schema);
        pairs.tag = 'tag:yaml.org,2002:pairs';
        let i = 0;
        if (iterable && Symbol.iterator in Object(iterable))
            for (let it of iterable) {
                if (typeof replacer === 'function')
                    it = replacer.call(iterable, String(i++), it);
                let key, value;
                if (Array.isArray(it)) {
                    if (it.length === 2) {
                        key = it[0];
                        value = it[1];
                    }
                    else
                        throw new TypeError(`Expected [key, value] tuple: ${it}`);
                }
                else if (it && it instanceof Object) {
                    const keys = Object.keys(it);
                    if (keys.length === 1) {
                        key = keys[0];
                        value = it[key];
                    }
                    else
                        throw new TypeError(`Expected { key: value } tuple: ${it}`);
                }
                else {
                    key = it;
                }
                pairs.items.push(createPair(key, value, ctx));
            }
        return pairs;
    }
    const pairs = {
        collection: 'seq',
        default: false,
        tag: 'tag:yaml.org,2002:pairs',
        resolve: resolvePairs,
        createNode: createPairs
    };

    class YAMLOMap extends YAMLSeq {
        constructor() {
            super();
            this.add = YAMLMap.prototype.add.bind(this);
            this.delete = YAMLMap.prototype.delete.bind(this);
            this.get = YAMLMap.prototype.get.bind(this);
            this.has = YAMLMap.prototype.has.bind(this);
            this.set = YAMLMap.prototype.set.bind(this);
            this.tag = YAMLOMap.tag;
        }
        /**
         * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
         * but TypeScript won't allow widening the signature of a child method.
         */
        toJSON(_, ctx) {
            if (!ctx)
                return super.toJSON(_);
            const map = new Map();
            if (ctx?.onCreate)
                ctx.onCreate(map);
            for (const pair of this.items) {
                let key, value;
                if (isPair(pair)) {
                    key = toJS(pair.key, '', ctx);
                    value = toJS(pair.value, key, ctx);
                }
                else {
                    key = toJS(pair, '', ctx);
                }
                if (map.has(key))
                    throw new Error('Ordered maps must not include duplicate keys');
                map.set(key, value);
            }
            return map;
        }
    }
    YAMLOMap.tag = 'tag:yaml.org,2002:omap';
    const omap = {
        collection: 'seq',
        identify: value => value instanceof Map,
        nodeClass: YAMLOMap,
        default: false,
        tag: 'tag:yaml.org,2002:omap',
        resolve(seq, onError) {
            const pairs = resolvePairs(seq, onError);
            const seenKeys = [];
            for (const { key } of pairs.items) {
                if (isScalar(key)) {
                    if (seenKeys.includes(key.value)) {
                        onError(`Ordered maps must not include duplicate keys: ${key.value}`);
                    }
                    else {
                        seenKeys.push(key.value);
                    }
                }
            }
            return Object.assign(new YAMLOMap(), pairs);
        },
        createNode(schema, iterable, ctx) {
            const pairs = createPairs(schema, iterable, ctx);
            const omap = new YAMLOMap();
            omap.items = pairs.items;
            return omap;
        }
    };

    function boolStringify({ value, source }, ctx) {
        const boolObj = value ? trueTag : falseTag;
        if (source && boolObj.test.test(source))
            return source;
        return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    const trueTag = {
        identify: value => value === true,
        default: true,
        tag: 'tag:yaml.org,2002:bool',
        test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
        resolve: () => new Scalar(true),
        stringify: boolStringify
    };
    const falseTag = {
        identify: value => value === false,
        default: true,
        tag: 'tag:yaml.org,2002:bool',
        test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/i,
        resolve: () => new Scalar(false),
        stringify: boolStringify
    };

    const floatNaN = {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        test: /^[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN)$/,
        resolve: (str) => str.slice(-3).toLowerCase() === 'nan'
            ? NaN
            : str[0] === '-'
                ? Number.NEGATIVE_INFINITY
                : Number.POSITIVE_INFINITY,
        stringify: stringifyNumber
    };
    const floatExp = {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        format: 'EXP',
        test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
        resolve: (str) => parseFloat(str.replace(/_/g, '')),
        stringify(node) {
            const num = Number(node.value);
            return isFinite(num) ? num.toExponential() : stringifyNumber(node);
        }
    };
    const float = {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
        resolve(str) {
            const node = new Scalar(parseFloat(str.replace(/_/g, '')));
            const dot = str.indexOf('.');
            if (dot !== -1) {
                const f = str.substring(dot + 1).replace(/_/g, '');
                if (f[f.length - 1] === '0')
                    node.minFractionDigits = f.length;
            }
            return node;
        },
        stringify: stringifyNumber
    };

    const intIdentify = (value) => typeof value === 'bigint' || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
        const sign = str[0];
        if (sign === '-' || sign === '+')
            offset += 1;
        str = str.substring(offset).replace(/_/g, '');
        if (intAsBigInt) {
            switch (radix) {
                case 2:
                    str = `0b${str}`;
                    break;
                case 8:
                    str = `0o${str}`;
                    break;
                case 16:
                    str = `0x${str}`;
                    break;
            }
            const n = BigInt(str);
            return sign === '-' ? BigInt(-1) * n : n;
        }
        const n = parseInt(str, radix);
        return sign === '-' ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
        const { value } = node;
        if (intIdentify(value)) {
            const str = value.toString(radix);
            return value < 0 ? '-' + prefix + str.substr(1) : prefix + str;
        }
        return stringifyNumber(node);
    }
    const intBin = {
        identify: intIdentify,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        format: 'BIN',
        test: /^[-+]?0b[0-1_]+$/,
        resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
        stringify: node => intStringify(node, 2, '0b')
    };
    const intOct = {
        identify: intIdentify,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        format: 'OCT',
        test: /^[-+]?0[0-7_]+$/,
        resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
        stringify: node => intStringify(node, 8, '0')
    };
    const int = {
        identify: intIdentify,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        test: /^[-+]?[0-9][0-9_]*$/,
        resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
        stringify: stringifyNumber
    };
    const intHex = {
        identify: intIdentify,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        format: 'HEX',
        test: /^[-+]?0x[0-9a-fA-F_]+$/,
        resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
        stringify: node => intStringify(node, 16, '0x')
    };

    class YAMLSet extends YAMLMap {
        constructor(schema) {
            super(schema);
            this.tag = YAMLSet.tag;
        }
        add(key) {
            let pair;
            if (isPair(key))
                pair = key;
            else if (key &&
                typeof key === 'object' &&
                'key' in key &&
                'value' in key &&
                key.value === null)
                pair = new Pair(key.key, null);
            else
                pair = new Pair(key, null);
            const prev = findPair(this.items, pair.key);
            if (!prev)
                this.items.push(pair);
        }
        /**
         * If `keepPair` is `true`, returns the Pair matching `key`.
         * Otherwise, returns the value of that Pair's key.
         */
        get(key, keepPair) {
            const pair = findPair(this.items, key);
            return !keepPair && isPair(pair)
                ? isScalar(pair.key)
                    ? pair.key.value
                    : pair.key
                : pair;
        }
        set(key, value) {
            if (typeof value !== 'boolean')
                throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
            const prev = findPair(this.items, key);
            if (prev && !value) {
                this.items.splice(this.items.indexOf(prev), 1);
            }
            else if (!prev && value) {
                this.items.push(new Pair(key));
            }
        }
        toJSON(_, ctx) {
            return super.toJSON(_, ctx, Set);
        }
        toString(ctx, onComment, onChompKeep) {
            if (!ctx)
                return JSON.stringify(this);
            if (this.hasAllNullValues(true))
                return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
            else
                throw new Error('Set items must all have null values');
        }
    }
    YAMLSet.tag = 'tag:yaml.org,2002:set';
    const set = {
        collection: 'map',
        identify: value => value instanceof Set,
        nodeClass: YAMLSet,
        default: false,
        tag: 'tag:yaml.org,2002:set',
        resolve(map, onError) {
            if (isMap(map)) {
                if (map.hasAllNullValues(true))
                    return Object.assign(new YAMLSet(), map);
                else
                    onError('Set items must all have null values');
            }
            else
                onError('Expected a mapping for this tag');
            return map;
        },
        createNode(schema, iterable, ctx) {
            const { replacer } = ctx;
            const set = new YAMLSet(schema);
            if (iterable && Symbol.iterator in Object(iterable))
                for (let value of iterable) {
                    if (typeof replacer === 'function')
                        value = replacer.call(iterable, value, value);
                    set.items.push(createPair(value, null, ctx));
                }
            return set;
        }
    };

    /** Internal types handle bigint as number, because TS can't figure it out. */
    function parseSexagesimal(str, asBigInt) {
        const sign = str[0];
        const parts = sign === '-' || sign === '+' ? str.substring(1) : str;
        const num = (n) => asBigInt ? BigInt(n) : Number(n);
        const res = parts
            .replace(/_/g, '')
            .split(':')
            .reduce((res, p) => res * num(60) + num(p), num(0));
        return (sign === '-' ? num(-1) * res : res);
    }
    /**
     * hhhh:mm:ss.sss
     *
     * Internal types handle bigint as number, because TS can't figure it out.
     */
    function stringifySexagesimal(node) {
        let { value } = node;
        let num = (n) => n;
        if (typeof value === 'bigint')
            num = n => BigInt(n);
        else if (isNaN(value) || !isFinite(value))
            return stringifyNumber(node);
        let sign = '';
        if (value < 0) {
            sign = '-';
            value *= num(-1);
        }
        const _60 = num(60);
        const parts = [value % _60]; // seconds, including ms
        if (value < 60) {
            parts.unshift(0); // at least one : is required
        }
        else {
            value = (value - parts[0]) / _60;
            parts.unshift(value % _60); // minutes
            if (value >= 60) {
                value = (value - parts[0]) / _60;
                parts.unshift(value); // hours
            }
        }
        return (sign +
            parts
                .map(n => (n < 10 ? '0' + String(n) : String(n)))
                .join(':')
                .replace(/000000\d*$/, '') // % 60 may introduce error
        );
    }
    const intTime = {
        identify: value => typeof value === 'bigint' || Number.isInteger(value),
        default: true,
        tag: 'tag:yaml.org,2002:int',
        format: 'TIME',
        test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
        resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
        stringify: stringifySexagesimal
    };
    const floatTime = {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        format: 'TIME',
        test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
        resolve: str => parseSexagesimal(str, false),
        stringify: stringifySexagesimal
    };
    const timestamp = {
        identify: value => value instanceof Date,
        default: true,
        tag: 'tag:yaml.org,2002:timestamp',
        // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
        // may be omitted altogether, resulting in a date format. In such a case, the time part is
        // assumed to be 00:00:00Z (start of day, UTC).
        test: RegExp('^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})' + // YYYY-Mm-Dd
            '(?:' + // time is optional
            '(?:t|T|[ \\t]+)' + // t | T | whitespace
            '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)' + // Hh:Mm:Ss(.ss)?
            '(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?' + // Z | +5 | -03:30
            ')?$'),
        resolve(str) {
            const match = str.match(timestamp.test);
            if (!match)
                throw new Error('!!timestamp expects a date, starting with yyyy-mm-dd');
            const [, year, month, day, hour, minute, second] = match.map(Number);
            const millisec = match[7] ? Number((match[7] + '00').substr(1, 3)) : 0;
            let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
            const tz = match[8];
            if (tz && tz !== 'Z') {
                let d = parseSexagesimal(tz, false);
                if (Math.abs(d) < 30)
                    d *= 60;
                date -= 60000 * d;
            }
            return new Date(date);
        },
        stringify: ({ value }) => value.toISOString().replace(/((T00:00)?:00)?\.000Z$/, '')
    };

    const schema = [
        map,
        seq,
        string,
        nullTag,
        trueTag,
        falseTag,
        intBin,
        intOct,
        int,
        intHex,
        floatNaN,
        floatExp,
        float,
        binary,
        omap,
        pairs,
        set,
        intTime,
        floatTime,
        timestamp
    ];

    const schemas = new Map([
        ['core', schema$2],
        ['failsafe', [map, seq, string]],
        ['json', schema$1],
        ['yaml11', schema],
        ['yaml-1.1', schema]
    ]);
    const tagsByName = {
        binary,
        bool: boolTag,
        float: float$1,
        floatExp: floatExp$1,
        floatNaN: floatNaN$1,
        floatTime,
        int: int$1,
        intHex: intHex$1,
        intOct: intOct$1,
        intTime,
        map,
        null: nullTag,
        omap,
        pairs,
        seq,
        set,
        timestamp
    };
    const coreKnownTags = {
        'tag:yaml.org,2002:binary': binary,
        'tag:yaml.org,2002:omap': omap,
        'tag:yaml.org,2002:pairs': pairs,
        'tag:yaml.org,2002:set': set,
        'tag:yaml.org,2002:timestamp': timestamp
    };
    function getTags(customTags, schemaName) {
        let tags = schemas.get(schemaName);
        if (!tags) {
            if (Array.isArray(customTags))
                tags = [];
            else {
                const keys = Array.from(schemas.keys())
                    .filter(key => key !== 'yaml11')
                    .map(key => JSON.stringify(key))
                    .join(', ');
                throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
            }
        }
        if (Array.isArray(customTags)) {
            for (const tag of customTags)
                tags = tags.concat(tag);
        }
        else if (typeof customTags === 'function') {
            tags = customTags(tags.slice());
        }
        return tags.map(tag => {
            if (typeof tag !== 'string')
                return tag;
            const tagObj = tagsByName[tag];
            if (tagObj)
                return tagObj;
            const keys = Object.keys(tagsByName)
                .map(key => JSON.stringify(key))
                .join(', ');
            throw new Error(`Unknown custom tag "${tag}"; use one of ${keys}`);
        });
    }

    const sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    class Schema {
        constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
            this.compat = Array.isArray(compat)
                ? getTags(compat, 'compat')
                : compat
                    ? getTags(null, compat)
                    : null;
            this.merge = !!merge;
            this.name = (typeof schema === 'string' && schema) || 'core';
            this.knownTags = resolveKnownTags ? coreKnownTags : {};
            this.tags = getTags(customTags, this.name);
            this.toStringOptions = toStringDefaults ?? null;
            Object.defineProperty(this, MAP, { value: map });
            Object.defineProperty(this, SCALAR$1, { value: string });
            Object.defineProperty(this, SEQ, { value: seq });
            // Used by createMap()
            this.sortMapEntries =
                typeof sortMapEntries === 'function'
                    ? sortMapEntries
                    : sortMapEntries === true
                        ? sortMapEntriesByKey
                        : null;
        }
        clone() {
            const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
            copy.tags = this.tags.slice();
            return copy;
        }
    }

    function stringifyDocument(doc, options) {
        const lines = [];
        let hasDirectives = options.directives === true;
        if (options.directives !== false && doc.directives) {
            const dir = doc.directives.toString(doc);
            if (dir) {
                lines.push(dir);
                hasDirectives = true;
            }
            else if (doc.directives.docStart)
                hasDirectives = true;
        }
        if (hasDirectives)
            lines.push('---');
        const ctx = createStringifyContext(doc, options);
        const { commentString } = ctx.options;
        if (doc.commentBefore) {
            if (lines.length !== 1)
                lines.unshift('');
            const cs = commentString(doc.commentBefore);
            lines.unshift(indentComment(cs, ''));
        }
        let chompKeep = false;
        let contentComment = null;
        if (doc.contents) {
            if (isNode(doc.contents)) {
                if (doc.contents.spaceBefore && hasDirectives)
                    lines.push('');
                if (doc.contents.commentBefore) {
                    const cs = commentString(doc.contents.commentBefore);
                    lines.push(indentComment(cs, ''));
                }
                // top-level block scalars need to be indented if followed by a comment
                ctx.forceBlockIndent = !!doc.comment;
                contentComment = doc.contents.comment;
            }
            const onChompKeep = contentComment ? undefined : () => (chompKeep = true);
            let body = stringify(doc.contents, ctx, () => (contentComment = null), onChompKeep);
            if (contentComment)
                body += lineComment(body, '', commentString(contentComment));
            if ((body[0] === '|' || body[0] === '>') &&
                lines[lines.length - 1] === '---') {
                // Top-level block scalars with a preceding doc marker ought to use the
                // same line for their header.
                lines[lines.length - 1] = `--- ${body}`;
            }
            else
                lines.push(body);
        }
        else {
            lines.push(stringify(doc.contents, ctx));
        }
        if (doc.directives?.docEnd) {
            if (doc.comment) {
                const cs = commentString(doc.comment);
                if (cs.includes('\n')) {
                    lines.push('...');
                    lines.push(indentComment(cs, ''));
                }
                else {
                    lines.push(`... ${cs}`);
                }
            }
            else {
                lines.push('...');
            }
        }
        else {
            let dc = doc.comment;
            if (dc && chompKeep)
                dc = dc.replace(/^\n+/, '');
            if (dc) {
                if ((!chompKeep || contentComment) && lines[lines.length - 1] !== '')
                    lines.push('');
                lines.push(indentComment(commentString(dc), ''));
            }
        }
        return lines.join('\n') + '\n';
    }

    /**
     * Applies the JSON.parse reviver algorithm as defined in the ECMA-262 spec,
     * in section 24.5.1.1 "Runtime Semantics: InternalizeJSONProperty" of the
     * 2021 edition: https://tc39.es/ecma262/#sec-json.parse
     *
     * Includes extensions for handling Map and Set objects.
     */
    function applyReviver(reviver, obj, key, val) {
        if (val && typeof val === 'object') {
            if (Array.isArray(val)) {
                for (let i = 0, len = val.length; i < len; ++i) {
                    const v0 = val[i];
                    const v1 = applyReviver(reviver, val, String(i), v0);
                    if (v1 === undefined)
                        delete val[i];
                    else if (v1 !== v0)
                        val[i] = v1;
                }
            }
            else if (val instanceof Map) {
                for (const k of Array.from(val.keys())) {
                    const v0 = val.get(k);
                    const v1 = applyReviver(reviver, val, k, v0);
                    if (v1 === undefined)
                        val.delete(k);
                    else if (v1 !== v0)
                        val.set(k, v1);
                }
            }
            else if (val instanceof Set) {
                for (const v0 of Array.from(val)) {
                    const v1 = applyReviver(reviver, val, v0, v0);
                    if (v1 === undefined)
                        val.delete(v0);
                    else if (v1 !== v0) {
                        val.delete(v0);
                        val.add(v1);
                    }
                }
            }
            else {
                for (const [k, v0] of Object.entries(val)) {
                    const v1 = applyReviver(reviver, val, k, v0);
                    if (v1 === undefined)
                        delete val[k];
                    else if (v1 !== v0)
                        val[k] = v1;
                }
            }
        }
        return reviver.call(obj, key, val);
    }

    class Document {
        constructor(value, replacer, options) {
            /** A comment before this Document */
            this.commentBefore = null;
            /** A comment immediately after this Document */
            this.comment = null;
            /** Errors encountered during parsing. */
            this.errors = [];
            /** Warnings encountered during parsing. */
            this.warnings = [];
            Object.defineProperty(this, NODE_TYPE, { value: DOC });
            let _replacer = null;
            if (typeof replacer === 'function' || Array.isArray(replacer)) {
                _replacer = replacer;
            }
            else if (options === undefined && replacer) {
                options = replacer;
                replacer = undefined;
            }
            const opt = Object.assign({
                intAsBigInt: false,
                keepSourceTokens: false,
                logLevel: 'warn',
                prettyErrors: true,
                strict: true,
                uniqueKeys: true,
                version: '1.2'
            }, options);
            this.options = opt;
            let { version } = opt;
            if (options?._directives) {
                this.directives = options._directives.atDocument();
                if (this.directives.yaml.explicit)
                    version = this.directives.yaml.version;
            }
            else
                this.directives = new Directives({ version });
            this.setSchema(version, options);
            if (value === undefined)
                this.contents = null;
            else {
                this.contents = this.createNode(value, _replacer, options);
            }
        }
        /**
         * Create a deep copy of this Document and its contents.
         *
         * Custom Node values that inherit from `Object` still refer to their original instances.
         */
        clone() {
            const copy = Object.create(Document.prototype, {
                [NODE_TYPE]: { value: DOC }
            });
            copy.commentBefore = this.commentBefore;
            copy.comment = this.comment;
            copy.errors = this.errors.slice();
            copy.warnings = this.warnings.slice();
            copy.options = Object.assign({}, this.options);
            if (this.directives)
                copy.directives = this.directives.clone();
            copy.schema = this.schema.clone();
            copy.contents = isNode(this.contents)
                ? this.contents.clone(copy.schema)
                : this.contents;
            if (this.range)
                copy.range = this.range.slice();
            return copy;
        }
        /** Adds a value to the document. */
        add(value) {
            if (assertCollection(this.contents))
                this.contents.add(value);
        }
        /** Adds a value to the document. */
        addIn(path, value) {
            if (assertCollection(this.contents))
                this.contents.addIn(path, value);
        }
        /**
         * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
         *
         * If `node` already has an anchor, `name` is ignored.
         * Otherwise, the `node.anchor` value will be set to `name`,
         * or if an anchor with that name is already present in the document,
         * `name` will be used as a prefix for a new unique anchor.
         * If `name` is undefined, the generated anchor will use 'a' as a prefix.
         */
        createAlias(node, name) {
            if (!node.anchor) {
                const prev = anchorNames(this);
                node.anchor =
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    !name || prev.has(name) ? findNewAnchor(name || 'a', prev) : name;
            }
            return new Alias(node.anchor);
        }
        createNode(value, replacer, options) {
            let _replacer = undefined;
            if (typeof replacer === 'function') {
                value = replacer.call({ '': value }, '', value);
                _replacer = replacer;
            }
            else if (Array.isArray(replacer)) {
                const keyToStr = (v) => typeof v === 'number' || v instanceof String || v instanceof Number;
                const asStr = replacer.filter(keyToStr).map(String);
                if (asStr.length > 0)
                    replacer = replacer.concat(asStr);
                _replacer = replacer;
            }
            else if (options === undefined && replacer) {
                options = replacer;
                replacer = undefined;
            }
            const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
            const { onAnchor, setAnchors, sourceObjects } = createNodeAnchors(this, 
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            anchorPrefix || 'a');
            const ctx = {
                aliasDuplicateObjects: aliasDuplicateObjects ?? true,
                keepUndefined: keepUndefined ?? false,
                onAnchor,
                onTagObj,
                replacer: _replacer,
                schema: this.schema,
                sourceObjects
            };
            const node = createNode(value, tag, ctx);
            if (flow && isCollection(node))
                node.flow = true;
            setAnchors();
            return node;
        }
        /**
         * Convert a key and a value into a `Pair` using the current schema,
         * recursively wrapping all values as `Scalar` or `Collection` nodes.
         */
        createPair(key, value, options = {}) {
            const k = this.createNode(key, null, options);
            const v = this.createNode(value, null, options);
            return new Pair(k, v);
        }
        /**
         * Removes a value from the document.
         * @returns `true` if the item was found and removed.
         */
        delete(key) {
            return assertCollection(this.contents) ? this.contents.delete(key) : false;
        }
        /**
         * Removes a value from the document.
         * @returns `true` if the item was found and removed.
         */
        deleteIn(path) {
            if (isEmptyPath(path)) {
                if (this.contents == null)
                    return false;
                this.contents = null;
                return true;
            }
            return assertCollection(this.contents)
                ? this.contents.deleteIn(path)
                : false;
        }
        /**
         * Returns item at `key`, or `undefined` if not found. By default unwraps
         * scalar values from their surrounding node; to disable set `keepScalar` to
         * `true` (collections are always returned intact).
         */
        get(key, keepScalar) {
            return isCollection(this.contents)
                ? this.contents.get(key, keepScalar)
                : undefined;
        }
        /**
         * Returns item at `path`, or `undefined` if not found. By default unwraps
         * scalar values from their surrounding node; to disable set `keepScalar` to
         * `true` (collections are always returned intact).
         */
        getIn(path, keepScalar) {
            if (isEmptyPath(path))
                return !keepScalar && isScalar(this.contents)
                    ? this.contents.value
                    : this.contents;
            return isCollection(this.contents)
                ? this.contents.getIn(path, keepScalar)
                : undefined;
        }
        /**
         * Checks if the document includes a value with the key `key`.
         */
        has(key) {
            return isCollection(this.contents) ? this.contents.has(key) : false;
        }
        /**
         * Checks if the document includes a value at `path`.
         */
        hasIn(path) {
            if (isEmptyPath(path))
                return this.contents !== undefined;
            return isCollection(this.contents) ? this.contents.hasIn(path) : false;
        }
        /**
         * Sets a value in this document. For `!!set`, `value` needs to be a
         * boolean to add/remove the item from the set.
         */
        set(key, value) {
            if (this.contents == null) {
                this.contents = collectionFromPath(this.schema, [key], value);
            }
            else if (assertCollection(this.contents)) {
                this.contents.set(key, value);
            }
        }
        /**
         * Sets a value in this document. For `!!set`, `value` needs to be a
         * boolean to add/remove the item from the set.
         */
        setIn(path, value) {
            if (isEmptyPath(path))
                this.contents = value;
            else if (this.contents == null) {
                this.contents = collectionFromPath(this.schema, Array.from(path), value);
            }
            else if (assertCollection(this.contents)) {
                this.contents.setIn(path, value);
            }
        }
        /**
         * Change the YAML version and schema used by the document.
         * A `null` version disables support for directives, explicit tags, anchors, and aliases.
         * It also requires the `schema` option to be given as a `Schema` instance value.
         *
         * Overrides all previously set schema options.
         */
        setSchema(version, options = {}) {
            if (typeof version === 'number')
                version = String(version);
            let opt;
            switch (version) {
                case '1.1':
                    if (this.directives)
                        this.directives.yaml.version = '1.1';
                    else
                        this.directives = new Directives({ version: '1.1' });
                    opt = { merge: true, resolveKnownTags: false, schema: 'yaml-1.1' };
                    break;
                case '1.2':
                case 'next':
                    if (this.directives)
                        this.directives.yaml.version = version;
                    else
                        this.directives = new Directives({ version });
                    opt = { merge: false, resolveKnownTags: true, schema: 'core' };
                    break;
                case null:
                    if (this.directives)
                        delete this.directives;
                    opt = null;
                    break;
                default: {
                    const sv = JSON.stringify(version);
                    throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
                }
            }
            // Not using `instanceof Schema` to allow for duck typing
            if (options.schema instanceof Object)
                this.schema = options.schema;
            else if (opt)
                this.schema = new Schema(Object.assign(opt, options));
            else
                throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
        }
        // json & jsonArg are only used from toJSON()
        toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
            const ctx = {
                anchors: new Map(),
                doc: this,
                keep: !json,
                mapAsMap: mapAsMap === true,
                mapKeyWarned: false,
                maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100,
                stringify
            };
            const res = toJS(this.contents, jsonArg ?? '', ctx);
            if (typeof onAnchor === 'function')
                for (const { count, res } of ctx.anchors.values())
                    onAnchor(res, count);
            return typeof reviver === 'function'
                ? applyReviver(reviver, { '': res }, '', res)
                : res;
        }
        /**
         * A JSON representation of the document `contents`.
         *
         * @param jsonArg Used by `JSON.stringify` to indicate the array index or
         *   property name.
         */
        toJSON(jsonArg, onAnchor) {
            return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
        }
        /** A YAML representation of the document. */
        toString(options = {}) {
            if (this.errors.length > 0)
                throw new Error('Document with errors cannot be stringified');
            if ('indent' in options &&
                (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
                const s = JSON.stringify(options.indent);
                throw new Error(`"indent" option must be a positive integer, not ${s}`);
            }
            return stringifyDocument(this, options);
        }
    }
    function assertCollection(contents) {
        if (isCollection(contents))
            return true;
        throw new Error('Expected a YAML collection as document contents');
    }

    class YAMLError extends Error {
        constructor(name, pos, code, message) {
            super();
            this.name = name;
            this.code = code;
            this.message = message;
            this.pos = pos;
        }
    }
    class YAMLParseError extends YAMLError {
        constructor(pos, code, message) {
            super('YAMLParseError', pos, code, message);
        }
    }
    class YAMLWarning extends YAMLError {
        constructor(pos, code, message) {
            super('YAMLWarning', pos, code, message);
        }
    }
    const prettifyError = (src, lc) => (error) => {
        if (error.pos[0] === -1)
            return;
        error.linePos = error.pos.map(pos => lc.linePos(pos));
        const { line, col } = error.linePos[0];
        error.message += ` at line ${line}, column ${col}`;
        let ci = col - 1;
        let lineStr = src
            .substring(lc.lineStarts[line - 1], lc.lineStarts[line])
            .replace(/[\n\r]+$/, '');
        // Trim to max 80 chars, keeping col position near the middle
        if (ci >= 60 && lineStr.length > 80) {
            const trimStart = Math.min(ci - 39, lineStr.length - 79);
            lineStr = '…' + lineStr.substring(trimStart);
            ci -= trimStart - 1;
        }
        if (lineStr.length > 80)
            lineStr = lineStr.substring(0, 79) + '…';
        // Include previous line in context if pointing at line start
        if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
            // Regexp won't match if start is trimmed
            let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
            if (prev.length > 80)
                prev = prev.substring(0, 79) + '…\n';
            lineStr = prev + lineStr;
        }
        if (/[^ ]/.test(lineStr)) {
            let count = 1;
            const end = error.linePos[1];
            if (end && end.line === line && end.col > col) {
                count = Math.min(end.col - col, 80 - ci);
            }
            const pointer = ' '.repeat(ci) + '^'.repeat(count);
            error.message += `:\n\n${lineStr}\n${pointer}\n`;
        }
    };

    function resolveProps(tokens, { flow, indicator, next, offset, onError, startOnNewline }) {
        let spaceBefore = false;
        let atNewline = startOnNewline;
        let hasSpace = startOnNewline;
        let comment = '';
        let commentSep = '';
        let hasNewline = false;
        let hasNewlineAfterProp = false;
        let reqSpace = false;
        let anchor = null;
        let tag = null;
        let comma = null;
        let found = null;
        let start = null;
        for (const token of tokens) {
            if (reqSpace) {
                if (token.type !== 'space' &&
                    token.type !== 'newline' &&
                    token.type !== 'comma')
                    onError(token.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
                reqSpace = false;
            }
            switch (token.type) {
                case 'space':
                    // At the doc level, tabs at line start may be parsed
                    // as leading white space rather than indentation.
                    // In a flow collection, only the parser handles indent.
                    if (!flow &&
                        atNewline &&
                        indicator !== 'doc-start' &&
                        token.source[0] === '\t')
                        onError(token, 'TAB_AS_INDENT', 'Tabs are not allowed as indentation');
                    hasSpace = true;
                    break;
                case 'comment': {
                    if (!hasSpace)
                        onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                    const cb = token.source.substring(1) || ' ';
                    if (!comment)
                        comment = cb;
                    else
                        comment += commentSep + cb;
                    commentSep = '';
                    atNewline = false;
                    break;
                }
                case 'newline':
                    if (atNewline) {
                        if (comment)
                            comment += token.source;
                        else
                            spaceBefore = true;
                    }
                    else
                        commentSep += token.source;
                    atNewline = true;
                    hasNewline = true;
                    if (anchor || tag)
                        hasNewlineAfterProp = true;
                    hasSpace = true;
                    break;
                case 'anchor':
                    if (anchor)
                        onError(token, 'MULTIPLE_ANCHORS', 'A node can have at most one anchor');
                    if (token.source.endsWith(':'))
                        onError(token.offset + token.source.length - 1, 'BAD_ALIAS', 'Anchor ending in : is ambiguous', true);
                    anchor = token;
                    if (start === null)
                        start = token.offset;
                    atNewline = false;
                    hasSpace = false;
                    reqSpace = true;
                    break;
                case 'tag': {
                    if (tag)
                        onError(token, 'MULTIPLE_TAGS', 'A node can have at most one tag');
                    tag = token;
                    if (start === null)
                        start = token.offset;
                    atNewline = false;
                    hasSpace = false;
                    reqSpace = true;
                    break;
                }
                case indicator:
                    // Could here handle preceding comments differently
                    if (anchor || tag)
                        onError(token, 'BAD_PROP_ORDER', `Anchors and tags must be after the ${token.source} indicator`);
                    if (found)
                        onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.source} in ${flow ?? 'collection'}`);
                    found = token;
                    atNewline = false;
                    hasSpace = false;
                    break;
                case 'comma':
                    if (flow) {
                        if (comma)
                            onError(token, 'UNEXPECTED_TOKEN', `Unexpected , in ${flow}`);
                        comma = token;
                        atNewline = false;
                        hasSpace = false;
                        break;
                    }
                // else fallthrough
                default:
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.type} token`);
                    atNewline = false;
                    hasSpace = false;
            }
        }
        const last = tokens[tokens.length - 1];
        const end = last ? last.offset + last.source.length : offset;
        if (reqSpace &&
            next &&
            next.type !== 'space' &&
            next.type !== 'newline' &&
            next.type !== 'comma' &&
            (next.type !== 'scalar' || next.source !== ''))
            onError(next.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
        return {
            comma,
            found,
            spaceBefore,
            comment,
            hasNewline,
            hasNewlineAfterProp,
            anchor,
            tag,
            end,
            start: start ?? end
        };
    }

    function containsNewline(key) {
        if (!key)
            return null;
        switch (key.type) {
            case 'alias':
            case 'scalar':
            case 'double-quoted-scalar':
            case 'single-quoted-scalar':
                if (key.source.includes('\n'))
                    return true;
                if (key.end)
                    for (const st of key.end)
                        if (st.type === 'newline')
                            return true;
                return false;
            case 'flow-collection':
                for (const it of key.items) {
                    for (const st of it.start)
                        if (st.type === 'newline')
                            return true;
                    if (it.sep)
                        for (const st of it.sep)
                            if (st.type === 'newline')
                                return true;
                    if (containsNewline(it.key) || containsNewline(it.value))
                        return true;
                }
                return false;
            default:
                return true;
        }
    }

    function flowIndentCheck(indent, fc, onError) {
        if (fc?.type === 'flow-collection') {
            const end = fc.end[0];
            if (end.indent === indent &&
                (end.source === ']' || end.source === '}') &&
                containsNewline(fc)) {
                const msg = 'Flow end indicator should be more indented than parent';
                onError(end, 'BAD_INDENT', msg, true);
            }
        }
    }

    function mapIncludes(ctx, items, search) {
        const { uniqueKeys } = ctx.options;
        if (uniqueKeys === false)
            return false;
        const isEqual = typeof uniqueKeys === 'function'
            ? uniqueKeys
            : (a, b) => a === b ||
                (isScalar(a) &&
                    isScalar(b) &&
                    a.value === b.value &&
                    !(a.value === '<<' && ctx.schema.merge));
        return items.some(pair => isEqual(pair.key, search));
    }

    const startColMsg = 'All mapping items must start at the same column';
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError) {
        const map = new YAMLMap(ctx.schema);
        if (ctx.atRoot)
            ctx.atRoot = false;
        let offset = bm.offset;
        let commentEnd = null;
        for (const collItem of bm.items) {
            const { start, key, sep, value } = collItem;
            // key properties
            const keyProps = resolveProps(start, {
                indicator: 'explicit-key-ind',
                next: key ?? sep?.[0],
                offset,
                onError,
                startOnNewline: true
            });
            const implicitKey = !keyProps.found;
            if (implicitKey) {
                if (key) {
                    if (key.type === 'block-seq')
                        onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'A block sequence may not be used as an implicit map key');
                    else if ('indent' in key && key.indent !== bm.indent)
                        onError(offset, 'BAD_INDENT', startColMsg);
                }
                if (!keyProps.anchor && !keyProps.tag && !sep) {
                    commentEnd = keyProps.end;
                    if (keyProps.comment) {
                        if (map.comment)
                            map.comment += '\n' + keyProps.comment;
                        else
                            map.comment = keyProps.comment;
                    }
                    continue;
                }
                if (keyProps.hasNewlineAfterProp || containsNewline(key)) {
                    onError(key ?? start[start.length - 1], 'MULTILINE_IMPLICIT_KEY', 'Implicit keys need to be on a single line');
                }
            }
            else if (keyProps.found?.indent !== bm.indent) {
                onError(offset, 'BAD_INDENT', startColMsg);
            }
            // key value
            const keyStart = keyProps.end;
            const keyNode = key
                ? composeNode(ctx, key, keyProps, onError)
                : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
            if (ctx.schema.compat)
                flowIndentCheck(bm.indent, key, onError);
            if (mapIncludes(ctx, map.items, keyNode))
                onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
            // value properties
            const valueProps = resolveProps(sep ?? [], {
                indicator: 'map-value-ind',
                next: value,
                offset: keyNode.range[2],
                onError,
                startOnNewline: !key || key.type === 'block-scalar'
            });
            offset = valueProps.end;
            if (valueProps.found) {
                if (implicitKey) {
                    if (value?.type === 'block-map' && !valueProps.hasNewline)
                        onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'Nested mappings are not allowed in compact mappings');
                    if (ctx.options.strict &&
                        keyProps.start < valueProps.found.offset - 1024)
                        onError(keyNode.range, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit block mapping key');
                }
                // value value
                const valueNode = value
                    ? composeNode(ctx, value, valueProps, onError)
                    : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
                if (ctx.schema.compat)
                    flowIndentCheck(bm.indent, value, onError);
                offset = valueNode.range[2];
                const pair = new Pair(keyNode, valueNode);
                if (ctx.options.keepSourceTokens)
                    pair.srcToken = collItem;
                map.items.push(pair);
            }
            else {
                // key with no value
                if (implicitKey)
                    onError(keyNode.range, 'MISSING_CHAR', 'Implicit map keys need to be followed by map values');
                if (valueProps.comment) {
                    if (keyNode.comment)
                        keyNode.comment += '\n' + valueProps.comment;
                    else
                        keyNode.comment = valueProps.comment;
                }
                const pair = new Pair(keyNode);
                if (ctx.options.keepSourceTokens)
                    pair.srcToken = collItem;
                map.items.push(pair);
            }
        }
        if (commentEnd && commentEnd < offset)
            onError(commentEnd, 'IMPOSSIBLE', 'Map comment with trailing content');
        map.range = [bm.offset, offset, commentEnd ?? offset];
        return map;
    }

    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError) {
        const seq = new YAMLSeq(ctx.schema);
        if (ctx.atRoot)
            ctx.atRoot = false;
        let offset = bs.offset;
        let commentEnd = null;
        for (const { start, value } of bs.items) {
            const props = resolveProps(start, {
                indicator: 'seq-item-ind',
                next: value,
                offset,
                onError,
                startOnNewline: true
            });
            if (!props.found) {
                if (props.anchor || props.tag || value) {
                    if (value && value.type === 'block-seq')
                        onError(props.end, 'BAD_INDENT', 'All sequence items must start at the same column');
                    else
                        onError(offset, 'MISSING_CHAR', 'Sequence item without - indicator');
                }
                else {
                    commentEnd = props.end;
                    if (props.comment)
                        seq.comment = props.comment;
                    continue;
                }
            }
            const node = value
                ? composeNode(ctx, value, props, onError)
                : composeEmptyNode(ctx, props.end, start, null, props, onError);
            if (ctx.schema.compat)
                flowIndentCheck(bs.indent, value, onError);
            offset = node.range[2];
            seq.items.push(node);
        }
        seq.range = [bs.offset, offset, commentEnd ?? offset];
        return seq;
    }

    function resolveEnd(end, offset, reqSpace, onError) {
        let comment = '';
        if (end) {
            let hasSpace = false;
            let sep = '';
            for (const token of end) {
                const { source, type } = token;
                switch (type) {
                    case 'space':
                        hasSpace = true;
                        break;
                    case 'comment': {
                        if (reqSpace && !hasSpace)
                            onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                        const cb = source.substring(1) || ' ';
                        if (!comment)
                            comment = cb;
                        else
                            comment += sep + cb;
                        sep = '';
                        break;
                    }
                    case 'newline':
                        if (comment)
                            sep += source;
                        hasSpace = true;
                        break;
                    default:
                        onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${type} at node end`);
                }
                offset += source.length;
            }
        }
        return { comment, offset };
    }

    const blockMsg = 'Block collections are not allowed within flow collections';
    const isBlock = (token) => token && (token.type === 'block-map' || token.type === 'block-seq');
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError) {
        const isMap = fc.start.source === '{';
        const fcName = isMap ? 'flow map' : 'flow sequence';
        const coll = isMap
            ? new YAMLMap(ctx.schema)
            : new YAMLSeq(ctx.schema);
        coll.flow = true;
        const atRoot = ctx.atRoot;
        if (atRoot)
            ctx.atRoot = false;
        let offset = fc.offset + fc.start.source.length;
        for (let i = 0; i < fc.items.length; ++i) {
            const collItem = fc.items[i];
            const { start, key, sep, value } = collItem;
            const props = resolveProps(start, {
                flow: fcName,
                indicator: 'explicit-key-ind',
                next: key ?? sep?.[0],
                offset,
                onError,
                startOnNewline: false
            });
            if (!props.found) {
                if (!props.anchor && !props.tag && !sep && !value) {
                    if (i === 0 && props.comma)
                        onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
                    else if (i < fc.items.length - 1)
                        onError(props.start, 'UNEXPECTED_TOKEN', `Unexpected empty item in ${fcName}`);
                    if (props.comment) {
                        if (coll.comment)
                            coll.comment += '\n' + props.comment;
                        else
                            coll.comment = props.comment;
                    }
                    offset = props.end;
                    continue;
                }
                if (!isMap && ctx.options.strict && containsNewline(key))
                    onError(key, // checked by containsNewline()
                    'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
            }
            if (i === 0) {
                if (props.comma)
                    onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
            }
            else {
                if (!props.comma)
                    onError(props.start, 'MISSING_CHAR', `Missing , between ${fcName} items`);
                if (props.comment) {
                    let prevItemComment = '';
                    loop: for (const st of start) {
                        switch (st.type) {
                            case 'comma':
                            case 'space':
                                break;
                            case 'comment':
                                prevItemComment = st.source.substring(1);
                                break loop;
                            default:
                                break loop;
                        }
                    }
                    if (prevItemComment) {
                        let prev = coll.items[coll.items.length - 1];
                        if (isPair(prev))
                            prev = prev.value ?? prev.key;
                        if (prev.comment)
                            prev.comment += '\n' + prevItemComment;
                        else
                            prev.comment = prevItemComment;
                        props.comment = props.comment.substring(prevItemComment.length + 1);
                    }
                }
            }
            if (!isMap && !sep && !props.found) {
                // item is a value in a seq
                // → key & sep are empty, start does not include ? or :
                const valueNode = value
                    ? composeNode(ctx, value, props, onError)
                    : composeEmptyNode(ctx, props.end, sep, null, props, onError);
                coll.items.push(valueNode);
                offset = valueNode.range[2];
                if (isBlock(value))
                    onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
            }
            else {
                // item is a key+value pair
                // key value
                const keyStart = props.end;
                const keyNode = key
                    ? composeNode(ctx, key, props, onError)
                    : composeEmptyNode(ctx, keyStart, start, null, props, onError);
                if (isBlock(key))
                    onError(keyNode.range, 'BLOCK_IN_FLOW', blockMsg);
                // value properties
                const valueProps = resolveProps(sep ?? [], {
                    flow: fcName,
                    indicator: 'map-value-ind',
                    next: value,
                    offset: keyNode.range[2],
                    onError,
                    startOnNewline: false
                });
                if (valueProps.found) {
                    if (!isMap && !props.found && ctx.options.strict) {
                        if (sep)
                            for (const st of sep) {
                                if (st === valueProps.found)
                                    break;
                                if (st.type === 'newline') {
                                    onError(st, 'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
                                    break;
                                }
                            }
                        if (props.start < valueProps.found.offset - 1024)
                            onError(valueProps.found, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit flow sequence key');
                    }
                }
                else if (value) {
                    if ('source' in value && value.source && value.source[0] === ':')
                        onError(value, 'MISSING_CHAR', `Missing space after : in ${fcName}`);
                    else
                        onError(valueProps.start, 'MISSING_CHAR', `Missing , or : between ${fcName} items`);
                }
                // value value
                const valueNode = value
                    ? composeNode(ctx, value, valueProps, onError)
                    : valueProps.found
                        ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError)
                        : null;
                if (valueNode) {
                    if (isBlock(value))
                        onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
                }
                else if (valueProps.comment) {
                    if (keyNode.comment)
                        keyNode.comment += '\n' + valueProps.comment;
                    else
                        keyNode.comment = valueProps.comment;
                }
                const pair = new Pair(keyNode, valueNode);
                if (ctx.options.keepSourceTokens)
                    pair.srcToken = collItem;
                if (isMap) {
                    const map = coll;
                    if (mapIncludes(ctx, map.items, keyNode))
                        onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
                    map.items.push(pair);
                }
                else {
                    const map = new YAMLMap(ctx.schema);
                    map.flow = true;
                    map.items.push(pair);
                    coll.items.push(map);
                }
                offset = valueNode ? valueNode.range[2] : valueProps.end;
            }
        }
        const expectedEnd = isMap ? '}' : ']';
        const [ce, ...ee] = fc.end;
        let cePos = offset;
        if (ce && ce.source === expectedEnd)
            cePos = ce.offset + ce.source.length;
        else {
            const name = fcName[0].toUpperCase() + fcName.substring(1);
            const msg = atRoot
                ? `${name} must end with a ${expectedEnd}`
                : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
            onError(offset, atRoot ? 'MISSING_CHAR' : 'BAD_INDENT', msg);
            if (ce && ce.source.length !== 1)
                ee.unshift(ce);
        }
        if (ee.length > 0) {
            const end = resolveEnd(ee, cePos, ctx.options.strict, onError);
            if (end.comment) {
                if (coll.comment)
                    coll.comment += '\n' + end.comment;
                else
                    coll.comment = end.comment;
            }
            coll.range = [fc.offset, cePos, end.offset];
        }
        else {
            coll.range = [fc.offset, cePos, cePos];
        }
        return coll;
    }

    function composeCollection(CN, ctx, token, tagToken, onError) {
        let coll;
        switch (token.type) {
            case 'block-map': {
                coll = resolveBlockMap(CN, ctx, token, onError);
                break;
            }
            case 'block-seq': {
                coll = resolveBlockSeq(CN, ctx, token, onError);
                break;
            }
            case 'flow-collection': {
                coll = resolveFlowCollection(CN, ctx, token, onError);
                break;
            }
        }
        if (!tagToken)
            return coll;
        const tagName = ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg));
        if (!tagName)
            return coll;
        // Cast needed due to: https://github.com/Microsoft/TypeScript/issues/3841
        const Coll = coll.constructor;
        if (tagName === '!' || tagName === Coll.tagName) {
            coll.tag = Coll.tagName;
            return coll;
        }
        const expType = isMap(coll) ? 'map' : 'seq';
        let tag = ctx.schema.tags.find(t => t.collection === expType && t.tag === tagName);
        if (!tag) {
            const kt = ctx.schema.knownTags[tagName];
            if (kt && kt.collection === expType) {
                ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
                tag = kt;
            }
            else {
                onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, true);
                coll.tag = tagName;
                return coll;
            }
        }
        const res = tag.resolve(coll, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg), ctx.options);
        const node = isNode(res)
            ? res
            : new Scalar(res);
        node.range = coll.range;
        node.tag = tagName;
        if (tag?.format)
            node.format = tag.format;
        return node;
    }

    function resolveBlockScalar(scalar, strict, onError) {
        const start = scalar.offset;
        const header = parseBlockScalarHeader(scalar, strict, onError);
        if (!header)
            return { value: '', type: null, comment: '', range: [start, start, start] };
        const type = header.mode === '>' ? Scalar.BLOCK_FOLDED : Scalar.BLOCK_LITERAL;
        const lines = scalar.source ? splitLines(scalar.source) : [];
        // determine the end of content & start of chomping
        let chompStart = lines.length;
        for (let i = lines.length - 1; i >= 0; --i) {
            const content = lines[i][1];
            if (content === '' || content === '\r')
                chompStart = i;
            else
                break;
        }
        // shortcut for empty contents
        if (chompStart === 0) {
            const value = header.chomp === '+' && lines.length > 0
                ? '\n'.repeat(Math.max(1, lines.length - 1))
                : '';
            let end = start + header.length;
            if (scalar.source)
                end += scalar.source.length;
            return { value, type, comment: header.comment, range: [start, end, end] };
        }
        // find the indentation level to trim from start
        let trimIndent = scalar.indent + header.indent;
        let offset = scalar.offset + header.length;
        let contentStart = 0;
        for (let i = 0; i < chompStart; ++i) {
            const [indent, content] = lines[i];
            if (content === '' || content === '\r') {
                if (header.indent === 0 && indent.length > trimIndent)
                    trimIndent = indent.length;
            }
            else {
                if (indent.length < trimIndent) {
                    const message = 'Block scalars with more-indented leading empty lines must use an explicit indentation indicator';
                    onError(offset + indent.length, 'MISSING_CHAR', message);
                }
                if (header.indent === 0)
                    trimIndent = indent.length;
                contentStart = i;
                break;
            }
            offset += indent.length + content.length + 1;
        }
        // include trailing more-indented empty lines in content
        for (let i = lines.length - 1; i >= chompStart; --i) {
            if (lines[i][0].length > trimIndent)
                chompStart = i + 1;
        }
        let value = '';
        let sep = '';
        let prevMoreIndented = false;
        // leading whitespace is kept intact
        for (let i = 0; i < contentStart; ++i)
            value += lines[i][0].slice(trimIndent) + '\n';
        for (let i = contentStart; i < chompStart; ++i) {
            let [indent, content] = lines[i];
            offset += indent.length + content.length + 1;
            const crlf = content[content.length - 1] === '\r';
            if (crlf)
                content = content.slice(0, -1);
            /* istanbul ignore if already caught in lexer */
            if (content && indent.length < trimIndent) {
                const src = header.indent
                    ? 'explicit indentation indicator'
                    : 'first line';
                const message = `Block scalar lines must not be less indented than their ${src}`;
                onError(offset - content.length - (crlf ? 2 : 1), 'BAD_INDENT', message);
                indent = '';
            }
            if (type === Scalar.BLOCK_LITERAL) {
                value += sep + indent.slice(trimIndent) + content;
                sep = '\n';
            }
            else if (indent.length > trimIndent || content[0] === '\t') {
                // more-indented content within a folded block
                if (sep === ' ')
                    sep = '\n';
                else if (!prevMoreIndented && sep === '\n')
                    sep = '\n\n';
                value += sep + indent.slice(trimIndent) + content;
                sep = '\n';
                prevMoreIndented = true;
            }
            else if (content === '') {
                // empty line
                if (sep === '\n')
                    value += '\n';
                else
                    sep = '\n';
            }
            else {
                value += sep + content;
                sep = ' ';
                prevMoreIndented = false;
            }
        }
        switch (header.chomp) {
            case '-':
                break;
            case '+':
                for (let i = chompStart; i < lines.length; ++i)
                    value += '\n' + lines[i][0].slice(trimIndent);
                if (value[value.length - 1] !== '\n')
                    value += '\n';
                break;
            default:
                value += '\n';
        }
        const end = start + header.length + scalar.source.length;
        return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
        /* istanbul ignore if should not happen */
        if (props[0].type !== 'block-scalar-header') {
            onError(props[0], 'IMPOSSIBLE', 'Block scalar header not found');
            return null;
        }
        const { source } = props[0];
        const mode = source[0];
        let indent = 0;
        let chomp = '';
        let error = -1;
        for (let i = 1; i < source.length; ++i) {
            const ch = source[i];
            if (!chomp && (ch === '-' || ch === '+'))
                chomp = ch;
            else {
                const n = Number(ch);
                if (!indent && n)
                    indent = n;
                else if (error === -1)
                    error = offset + i;
            }
        }
        if (error !== -1)
            onError(error, 'UNEXPECTED_TOKEN', `Block scalar header includes extra characters: ${source}`);
        let hasSpace = false;
        let comment = '';
        let length = source.length;
        for (let i = 1; i < props.length; ++i) {
            const token = props[i];
            switch (token.type) {
                case 'space':
                    hasSpace = true;
                // fallthrough
                case 'newline':
                    length += token.source.length;
                    break;
                case 'comment':
                    if (strict && !hasSpace) {
                        const message = 'Comments must be separated from other tokens by white space characters';
                        onError(token, 'MISSING_CHAR', message);
                    }
                    length += token.source.length;
                    comment = token.source.substring(1);
                    break;
                case 'error':
                    onError(token, 'UNEXPECTED_TOKEN', token.message);
                    length += token.source.length;
                    break;
                /* istanbul ignore next should not happen */
                default: {
                    const message = `Unexpected token in block scalar header: ${token.type}`;
                    onError(token, 'UNEXPECTED_TOKEN', message);
                    const ts = token.source;
                    if (ts && typeof ts === 'string')
                        length += ts.length;
                }
            }
        }
        return { mode, indent, chomp, comment, length };
    }
    /** @returns Array of lines split up as `[indent, content]` */
    function splitLines(source) {
        const split = source.split(/\n( *)/);
        const first = split[0];
        const m = first.match(/^( *)/);
        const line0 = m?.[1]
            ? [m[1], first.slice(m[1].length)]
            : ['', first];
        const lines = [line0];
        for (let i = 1; i < split.length; i += 2)
            lines.push([split[i], split[i + 1]]);
        return lines;
    }

    function resolveFlowScalar(scalar, strict, onError) {
        const { offset, type, source, end } = scalar;
        let _type;
        let value;
        const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
        switch (type) {
            case 'scalar':
                _type = Scalar.PLAIN;
                value = plainValue(source, _onError);
                break;
            case 'single-quoted-scalar':
                _type = Scalar.QUOTE_SINGLE;
                value = singleQuotedValue(source, _onError);
                break;
            case 'double-quoted-scalar':
                _type = Scalar.QUOTE_DOUBLE;
                value = doubleQuotedValue(source, _onError);
                break;
            /* istanbul ignore next should not happen */
            default:
                onError(scalar, 'UNEXPECTED_TOKEN', `Expected a flow scalar value, but found: ${type}`);
                return {
                    value: '',
                    type: null,
                    comment: '',
                    range: [offset, offset + source.length, offset + source.length]
                };
        }
        const valueEnd = offset + source.length;
        const re = resolveEnd(end, valueEnd, strict, onError);
        return {
            value,
            type: _type,
            comment: re.comment,
            range: [offset, valueEnd, re.offset]
        };
    }
    function plainValue(source, onError) {
        let badChar = '';
        switch (source[0]) {
            /* istanbul ignore next should not happen */
            case '\t':
                badChar = 'a tab character';
                break;
            case ',':
                badChar = 'flow indicator character ,';
                break;
            case '%':
                badChar = 'directive indicator character %';
                break;
            case '|':
            case '>': {
                badChar = `block scalar indicator ${source[0]}`;
                break;
            }
            case '@':
            case '`': {
                badChar = `reserved character ${source[0]}`;
                break;
            }
        }
        if (badChar)
            onError(0, 'BAD_SCALAR_START', `Plain value cannot start with ${badChar}`);
        return foldLines(source);
    }
    function singleQuotedValue(source, onError) {
        if (source[source.length - 1] !== "'" || source.length === 1)
            onError(source.length, 'MISSING_CHAR', "Missing closing 'quote");
        return foldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function foldLines(source) {
        /**
         * The negative lookbehind here and in the `re` RegExp is to
         * prevent causing a polynomial search time in certain cases.
         *
         * The try-catch is for Safari, which doesn't support this yet:
         * https://caniuse.com/js-regexp-lookbehind
         */
        let first, line;
        try {
            first = new RegExp('(.*?)(?<![ \t])[ \t]*\r?\n', 'sy');
            line = new RegExp('[ \t]*(.*?)(?:(?<![ \t])[ \t]*)?\r?\n', 'sy');
        }
        catch (_) {
            first = /(.*?)[ \t]*\r?\n/sy;
            line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
        }
        let match = first.exec(source);
        if (!match)
            return source;
        let res = match[1];
        let sep = ' ';
        let pos = first.lastIndex;
        line.lastIndex = pos;
        while ((match = line.exec(source))) {
            if (match[1] === '') {
                if (sep === '\n')
                    res += sep;
                else
                    sep = '\n';
            }
            else {
                res += sep + match[1];
                sep = ' ';
            }
            pos = line.lastIndex;
        }
        const last = /[ \t]*(.*)/sy;
        last.lastIndex = pos;
        match = last.exec(source);
        return res + sep + (match?.[1] ?? '');
    }
    function doubleQuotedValue(source, onError) {
        let res = '';
        for (let i = 1; i < source.length - 1; ++i) {
            const ch = source[i];
            if (ch === '\r' && source[i + 1] === '\n')
                continue;
            if (ch === '\n') {
                const { fold, offset } = foldNewline(source, i);
                res += fold;
                i = offset;
            }
            else if (ch === '\\') {
                let next = source[++i];
                const cc = escapeCodes[next];
                if (cc)
                    res += cc;
                else if (next === '\n') {
                    // skip escaped newlines, but still trim the following line
                    next = source[i + 1];
                    while (next === ' ' || next === '\t')
                        next = source[++i + 1];
                }
                else if (next === '\r' && source[i + 1] === '\n') {
                    // skip escaped CRLF newlines, but still trim the following line
                    next = source[++i + 1];
                    while (next === ' ' || next === '\t')
                        next = source[++i + 1];
                }
                else if (next === 'x' || next === 'u' || next === 'U') {
                    const length = { x: 2, u: 4, U: 8 }[next];
                    res += parseCharCode(source, i + 1, length, onError);
                    i += length;
                }
                else {
                    const raw = source.substr(i - 1, 2);
                    onError(i - 1, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
                    res += raw;
                }
            }
            else if (ch === ' ' || ch === '\t') {
                // trim trailing whitespace
                const wsStart = i;
                let next = source[i + 1];
                while (next === ' ' || next === '\t')
                    next = source[++i + 1];
                if (next !== '\n' && !(next === '\r' && source[i + 2] === '\n'))
                    res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
            }
            else {
                res += ch;
            }
        }
        if (source[source.length - 1] !== '"' || source.length === 1)
            onError(source.length, 'MISSING_CHAR', 'Missing closing "quote');
        return res;
    }
    /**
     * Fold a single newline into a space, multiple newlines to N - 1 newlines.
     * Presumes `source[offset] === '\n'`
     */
    function foldNewline(source, offset) {
        let fold = '';
        let ch = source[offset + 1];
        while (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
            if (ch === '\r' && source[offset + 2] !== '\n')
                break;
            if (ch === '\n')
                fold += '\n';
            offset += 1;
            ch = source[offset + 1];
        }
        if (!fold)
            fold = ' ';
        return { fold, offset };
    }
    const escapeCodes = {
        '0': '\0',
        a: '\x07',
        b: '\b',
        e: '\x1b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t',
        v: '\v',
        N: '\u0085',
        _: '\u00a0',
        L: '\u2028',
        P: '\u2029',
        ' ': ' ',
        '"': '"',
        '/': '/',
        '\\': '\\',
        '\t': '\t'
    };
    function parseCharCode(source, offset, length, onError) {
        const cc = source.substr(offset, length);
        const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
        const code = ok ? parseInt(cc, 16) : NaN;
        if (isNaN(code)) {
            const raw = source.substr(offset - 2, length + 2);
            onError(offset - 2, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
            return raw;
        }
        return String.fromCodePoint(code);
    }

    function composeScalar(ctx, token, tagToken, onError) {
        const { value, type, comment, range } = token.type === 'block-scalar'
            ? resolveBlockScalar(token, ctx.options.strict, onError)
            : resolveFlowScalar(token, ctx.options.strict, onError);
        const tagName = tagToken
            ? ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg))
            : null;
        const tag = tagToken && tagName
            ? findScalarTagByName(ctx.schema, value, tagName, tagToken, onError)
            : token.type === 'scalar'
                ? findScalarTagByTest(ctx, value, token, onError)
                : ctx.schema[SCALAR$1];
        let scalar;
        try {
            const res = tag.resolve(value, msg => onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg), ctx.options);
            scalar = isScalar(res) ? res : new Scalar(res);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg);
            scalar = new Scalar(value);
        }
        scalar.range = range;
        scalar.source = value;
        if (type)
            scalar.type = type;
        if (tagName)
            scalar.tag = tagName;
        if (tag.format)
            scalar.format = tag.format;
        if (comment)
            scalar.comment = comment;
        return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
        if (tagName === '!')
            return schema[SCALAR$1]; // non-specific tag
        const matchWithTest = [];
        for (const tag of schema.tags) {
            if (!tag.collection && tag.tag === tagName) {
                if (tag.default && tag.test)
                    matchWithTest.push(tag);
                else
                    return tag;
            }
        }
        for (const tag of matchWithTest)
            if (tag.test?.test(value))
                return tag;
        const kt = schema.knownTags[tagName];
        if (kt && !kt.collection) {
            // Ensure that the known tag is available for stringifying,
            // but does not get used by default.
            schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
            return kt;
        }
        onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, tagName !== 'tag:yaml.org,2002:str');
        return schema[SCALAR$1];
    }
    function findScalarTagByTest({ directives, schema }, value, token, onError) {
        const tag = schema.tags.find(tag => tag.default && tag.test?.test(value)) || schema[SCALAR$1];
        if (schema.compat) {
            const compat = schema.compat.find(tag => tag.default && tag.test?.test(value)) ??
                schema[SCALAR$1];
            if (tag.tag !== compat.tag) {
                const ts = directives.tagString(tag.tag);
                const cs = directives.tagString(compat.tag);
                const msg = `Value may be parsed as either ${ts} or ${cs}`;
                onError(token, 'TAG_RESOLVE_FAILED', msg, true);
            }
        }
        return tag;
    }

    function emptyScalarPosition(offset, before, pos) {
        if (before) {
            if (pos === null)
                pos = before.length;
            for (let i = pos - 1; i >= 0; --i) {
                let st = before[i];
                switch (st.type) {
                    case 'space':
                    case 'comment':
                    case 'newline':
                        offset -= st.source.length;
                        continue;
                }
                // Technically, an empty scalar is immediately after the last non-empty
                // node, but it's more useful to place it after any whitespace.
                st = before[++i];
                while (st?.type === 'space') {
                    offset += st.source.length;
                    st = before[++i];
                }
                break;
            }
        }
        return offset;
    }

    const CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
        const { spaceBefore, comment, anchor, tag } = props;
        let node;
        let isSrcToken = true;
        switch (token.type) {
            case 'alias':
                node = composeAlias(ctx, token, onError);
                if (anchor || tag)
                    onError(token, 'ALIAS_PROPS', 'An alias node must not specify any properties');
                break;
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
            case 'block-scalar':
                node = composeScalar(ctx, token, tag, onError);
                if (anchor)
                    node.anchor = anchor.source.substring(1);
                break;
            case 'block-map':
            case 'block-seq':
            case 'flow-collection':
                node = composeCollection(CN, ctx, token, tag, onError);
                if (anchor)
                    node.anchor = anchor.source.substring(1);
                break;
            default: {
                const message = token.type === 'error'
                    ? token.message
                    : `Unsupported token (type: ${token.type})`;
                onError(token, 'UNEXPECTED_TOKEN', message);
                node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError);
                isSrcToken = false;
            }
        }
        if (anchor && node.anchor === '')
            onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
        if (spaceBefore)
            node.spaceBefore = true;
        if (comment) {
            if (token.type === 'scalar' && token.source === '')
                node.comment = comment;
            else
                node.commentBefore = comment;
        }
        // @ts-expect-error Type checking misses meaning of isSrcToken
        if (ctx.options.keepSourceTokens && isSrcToken)
            node.srcToken = token;
        return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
        const token = {
            type: 'scalar',
            offset: emptyScalarPosition(offset, before, pos),
            indent: -1,
            source: ''
        };
        const node = composeScalar(ctx, token, tag, onError);
        if (anchor) {
            node.anchor = anchor.source.substring(1);
            if (node.anchor === '')
                onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
        }
        if (spaceBefore)
            node.spaceBefore = true;
        if (comment) {
            node.comment = comment;
            node.range[2] = end;
        }
        return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
        const alias = new Alias(source.substring(1));
        if (alias.source === '')
            onError(offset, 'BAD_ALIAS', 'Alias cannot be an empty string');
        if (alias.source.endsWith(':'))
            onError(offset + source.length - 1, 'BAD_ALIAS', 'Alias ending in : is ambiguous', true);
        const valueEnd = offset + source.length;
        const re = resolveEnd(end, valueEnd, options.strict, onError);
        alias.range = [offset, valueEnd, re.offset];
        if (re.comment)
            alias.comment = re.comment;
        return alias;
    }

    function composeDoc(options, directives, { offset, start, value, end }, onError) {
        const opts = Object.assign({ _directives: directives }, options);
        const doc = new Document(undefined, opts);
        const ctx = {
            atRoot: true,
            directives: doc.directives,
            options: doc.options,
            schema: doc.schema
        };
        const props = resolveProps(start, {
            indicator: 'doc-start',
            next: value ?? end?.[0],
            offset,
            onError,
            startOnNewline: true
        });
        if (props.found) {
            doc.directives.docStart = true;
            if (value &&
                (value.type === 'block-map' || value.type === 'block-seq') &&
                !props.hasNewline)
                onError(props.end, 'MISSING_CHAR', 'Block collection cannot start on same line with directives-end marker');
        }
        doc.contents = value
            ? composeNode(ctx, value, props, onError)
            : composeEmptyNode(ctx, props.end, start, null, props, onError);
        const contentEnd = doc.contents.range[2];
        const re = resolveEnd(end, contentEnd, false, onError);
        if (re.comment)
            doc.comment = re.comment;
        doc.range = [offset, contentEnd, re.offset];
        return doc;
    }

    function getErrorPos(src) {
        if (typeof src === 'number')
            return [src, src + 1];
        if (Array.isArray(src))
            return src.length === 2 ? src : [src[0], src[1]];
        const { offset, source } = src;
        return [offset, offset + (typeof source === 'string' ? source.length : 1)];
    }
    function parsePrelude(prelude) {
        let comment = '';
        let atComment = false;
        let afterEmptyLine = false;
        for (let i = 0; i < prelude.length; ++i) {
            const source = prelude[i];
            switch (source[0]) {
                case '#':
                    comment +=
                        (comment === '' ? '' : afterEmptyLine ? '\n\n' : '\n') +
                            (source.substring(1) || ' ');
                    atComment = true;
                    afterEmptyLine = false;
                    break;
                case '%':
                    if (prelude[i + 1]?.[0] !== '#')
                        i += 1;
                    atComment = false;
                    break;
                default:
                    // This may be wrong after doc-end, but in that case it doesn't matter
                    if (!atComment)
                        afterEmptyLine = true;
                    atComment = false;
            }
        }
        return { comment, afterEmptyLine };
    }
    /**
     * Compose a stream of CST nodes into a stream of YAML Documents.
     *
     * ```ts
     * import { Composer, Parser } from 'yaml'
     *
     * const src: string = ...
     * const tokens = new Parser().parse(src)
     * const docs = new Composer().compose(tokens)
     * ```
     */
    class Composer {
        constructor(options = {}) {
            this.doc = null;
            this.atDirectives = false;
            this.prelude = [];
            this.errors = [];
            this.warnings = [];
            this.onError = (source, code, message, warning) => {
                const pos = getErrorPos(source);
                if (warning)
                    this.warnings.push(new YAMLWarning(pos, code, message));
                else
                    this.errors.push(new YAMLParseError(pos, code, message));
            };
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            this.directives = new Directives({ version: options.version || '1.2' });
            this.options = options;
        }
        decorate(doc, afterDoc) {
            const { comment, afterEmptyLine } = parsePrelude(this.prelude);
            //console.log({ dc: doc.comment, prelude, comment })
            if (comment) {
                const dc = doc.contents;
                if (afterDoc) {
                    doc.comment = doc.comment ? `${doc.comment}\n${comment}` : comment;
                }
                else if (afterEmptyLine || doc.directives.docStart || !dc) {
                    doc.commentBefore = comment;
                }
                else if (isCollection(dc) && !dc.flow && dc.items.length > 0) {
                    let it = dc.items[0];
                    if (isPair(it))
                        it = it.key;
                    const cb = it.commentBefore;
                    it.commentBefore = cb ? `${comment}\n${cb}` : comment;
                }
                else {
                    const cb = dc.commentBefore;
                    dc.commentBefore = cb ? `${comment}\n${cb}` : comment;
                }
            }
            if (afterDoc) {
                Array.prototype.push.apply(doc.errors, this.errors);
                Array.prototype.push.apply(doc.warnings, this.warnings);
            }
            else {
                doc.errors = this.errors;
                doc.warnings = this.warnings;
            }
            this.prelude = [];
            this.errors = [];
            this.warnings = [];
        }
        /**
         * Current stream status information.
         *
         * Mostly useful at the end of input for an empty stream.
         */
        streamInfo() {
            return {
                comment: parsePrelude(this.prelude).comment,
                directives: this.directives,
                errors: this.errors,
                warnings: this.warnings
            };
        }
        /**
         * Compose tokens into documents.
         *
         * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
         * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
         */
        *compose(tokens, forceDoc = false, endOffset = -1) {
            for (const token of tokens)
                yield* this.next(token);
            yield* this.end(forceDoc, endOffset);
        }
        /** Advance the composer by one CST token. */
        *next(token) {
            switch (token.type) {
                case 'directive':
                    this.directives.add(token.source, (offset, message, warning) => {
                        const pos = getErrorPos(token);
                        pos[0] += offset;
                        this.onError(pos, 'BAD_DIRECTIVE', message, warning);
                    });
                    this.prelude.push(token.source);
                    this.atDirectives = true;
                    break;
                case 'document': {
                    const doc = composeDoc(this.options, this.directives, token, this.onError);
                    if (this.atDirectives && !doc.directives.docStart)
                        this.onError(token, 'MISSING_CHAR', 'Missing directives-end/doc-start indicator line');
                    this.decorate(doc, false);
                    if (this.doc)
                        yield this.doc;
                    this.doc = doc;
                    this.atDirectives = false;
                    break;
                }
                case 'byte-order-mark':
                case 'space':
                    break;
                case 'comment':
                case 'newline':
                    this.prelude.push(token.source);
                    break;
                case 'error': {
                    const msg = token.source
                        ? `${token.message}: ${JSON.stringify(token.source)}`
                        : token.message;
                    const error = new YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg);
                    if (this.atDirectives || !this.doc)
                        this.errors.push(error);
                    else
                        this.doc.errors.push(error);
                    break;
                }
                case 'doc-end': {
                    if (!this.doc) {
                        const msg = 'Unexpected doc-end without preceding document';
                        this.errors.push(new YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg));
                        break;
                    }
                    this.doc.directives.docEnd = true;
                    const end = resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
                    this.decorate(this.doc, true);
                    if (end.comment) {
                        const dc = this.doc.comment;
                        this.doc.comment = dc ? `${dc}\n${end.comment}` : end.comment;
                    }
                    this.doc.range[2] = end.offset;
                    break;
                }
                default:
                    this.errors.push(new YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', `Unsupported token ${token.type}`));
            }
        }
        /**
         * Call at end of input to yield any remaining document.
         *
         * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
         * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
         */
        *end(forceDoc = false, endOffset = -1) {
            if (this.doc) {
                this.decorate(this.doc, true);
                yield this.doc;
                this.doc = null;
            }
            else if (forceDoc) {
                const opts = Object.assign({ _directives: this.directives }, this.options);
                const doc = new Document(undefined, opts);
                if (this.atDirectives)
                    this.onError(endOffset, 'MISSING_CHAR', 'Missing directives-end indicator line');
                doc.range = [0, endOffset, endOffset];
                this.decorate(doc, false);
                yield doc;
            }
        }
    }

    /** The byte order mark */
    const BOM = '\u{FEFF}';
    /** Start of doc-mode */
    const DOCUMENT = '\x02'; // C0: Start of Text
    /** Unexpected end of flow-mode */
    const FLOW_END = '\x18'; // C0: Cancel
    /** Next token is a scalar value */
    const SCALAR = '\x1f'; // C0: Unit Separator
    /** Identify the type of a lexer token. May return `null` for unknown tokens. */
    function tokenType(source) {
        switch (source) {
            case BOM:
                return 'byte-order-mark';
            case DOCUMENT:
                return 'doc-mode';
            case FLOW_END:
                return 'flow-error-end';
            case SCALAR:
                return 'scalar';
            case '---':
                return 'doc-start';
            case '...':
                return 'doc-end';
            case '':
            case '\n':
            case '\r\n':
                return 'newline';
            case '-':
                return 'seq-item-ind';
            case '?':
                return 'explicit-key-ind';
            case ':':
                return 'map-value-ind';
            case '{':
                return 'flow-map-start';
            case '}':
                return 'flow-map-end';
            case '[':
                return 'flow-seq-start';
            case ']':
                return 'flow-seq-end';
            case ',':
                return 'comma';
        }
        switch (source[0]) {
            case ' ':
            case '\t':
                return 'space';
            case '#':
                return 'comment';
            case '%':
                return 'directive-line';
            case '*':
                return 'alias';
            case '&':
                return 'anchor';
            case '!':
                return 'tag';
            case "'":
                return 'single-quoted-scalar';
            case '"':
                return 'double-quoted-scalar';
            case '|':
            case '>':
                return 'block-scalar-header';
        }
        return null;
    }

    /*
    START -> stream

    stream
      directive -> line-end -> stream
      indent + line-end -> stream
      [else] -> line-start

    line-end
      comment -> line-end
      newline -> .
      input-end -> END

    line-start
      doc-start -> doc
      doc-end -> stream
      [else] -> indent -> block-start

    block-start
      seq-item-start -> block-start
      explicit-key-start -> block-start
      map-value-start -> block-start
      [else] -> doc

    doc
      line-end -> line-start
      spaces -> doc
      anchor -> doc
      tag -> doc
      flow-start -> flow -> doc
      flow-end -> error -> doc
      seq-item-start -> error -> doc
      explicit-key-start -> error -> doc
      map-value-start -> doc
      alias -> doc
      quote-start -> quoted-scalar -> doc
      block-scalar-header -> line-end -> block-scalar(min) -> line-start
      [else] -> plain-scalar(false, min) -> doc

    flow
      line-end -> flow
      spaces -> flow
      anchor -> flow
      tag -> flow
      flow-start -> flow -> flow
      flow-end -> .
      seq-item-start -> error -> flow
      explicit-key-start -> flow
      map-value-start -> flow
      alias -> flow
      quote-start -> quoted-scalar -> flow
      comma -> flow
      [else] -> plain-scalar(true, 0) -> flow

    quoted-scalar
      quote-end -> .
      [else] -> quoted-scalar

    block-scalar(min)
      newline + peek(indent < min) -> .
      [else] -> block-scalar(min)

    plain-scalar(is-flow, min)
      scalar-end(is-flow) -> .
      peek(newline + (indent < min)) -> .
      [else] -> plain-scalar(min)
    */
    function isEmpty(ch) {
        switch (ch) {
            case undefined:
            case ' ':
            case '\n':
            case '\r':
            case '\t':
                return true;
            default:
                return false;
        }
    }
    const hexDigits = '0123456789ABCDEFabcdef'.split('');
    const tagChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()".split('');
    const invalidFlowScalarChars = ',[]{}'.split('');
    const invalidAnchorChars = ' ,[]{}\n\r\t'.split('');
    const isNotAnchorChar = (ch) => !ch || invalidAnchorChars.includes(ch);
    /**
     * Splits an input string into lexical tokens, i.e. smaller strings that are
     * easily identifiable by `tokens.tokenType()`.
     *
     * Lexing starts always in a "stream" context. Incomplete input may be buffered
     * until a complete token can be emitted.
     *
     * In addition to slices of the original input, the following control characters
     * may also be emitted:
     *
     * - `\x02` (Start of Text): A document starts with the next token
     * - `\x18` (Cancel): Unexpected end of flow-mode (indicates an error)
     * - `\x1f` (Unit Separator): Next token is a scalar value
     * - `\u{FEFF}` (Byte order mark): Emitted separately outside documents
     */
    class Lexer {
        constructor() {
            /**
             * Flag indicating whether the end of the current buffer marks the end of
             * all input
             */
            this.atEnd = false;
            /**
             * Explicit indent set in block scalar header, as an offset from the current
             * minimum indent, so e.g. set to 1 from a header `|2+`. Set to -1 if not
             * explicitly set.
             */
            this.blockScalarIndent = -1;
            /**
             * Block scalars that include a + (keep) chomping indicator in their header
             * include trailing empty lines, which are otherwise excluded from the
             * scalar's contents.
             */
            this.blockScalarKeep = false;
            /** Current input */
            this.buffer = '';
            /**
             * Flag noting whether the map value indicator : can immediately follow this
             * node within a flow context.
             */
            this.flowKey = false;
            /** Count of surrounding flow collection levels. */
            this.flowLevel = 0;
            /**
             * Minimum level of indentation required for next lines to be parsed as a
             * part of the current scalar value.
             */
            this.indentNext = 0;
            /** Indentation level of the current line. */
            this.indentValue = 0;
            /** Position of the next \n character. */
            this.lineEndPos = null;
            /** Stores the state of the lexer if reaching the end of incpomplete input */
            this.next = null;
            /** A pointer to `buffer`; the current position of the lexer. */
            this.pos = 0;
        }
        /**
         * Generate YAML tokens from the `source` string. If `incomplete`,
         * a part of the last line may be left as a buffer for the next call.
         *
         * @returns A generator of lexical tokens
         */
        *lex(source, incomplete = false) {
            if (source) {
                this.buffer = this.buffer ? this.buffer + source : source;
                this.lineEndPos = null;
            }
            this.atEnd = !incomplete;
            let next = this.next ?? 'stream';
            while (next && (incomplete || this.hasChars(1)))
                next = yield* this.parseNext(next);
        }
        atLineEnd() {
            let i = this.pos;
            let ch = this.buffer[i];
            while (ch === ' ' || ch === '\t')
                ch = this.buffer[++i];
            if (!ch || ch === '#' || ch === '\n')
                return true;
            if (ch === '\r')
                return this.buffer[i + 1] === '\n';
            return false;
        }
        charAt(n) {
            return this.buffer[this.pos + n];
        }
        continueScalar(offset) {
            let ch = this.buffer[offset];
            if (this.indentNext > 0) {
                let indent = 0;
                while (ch === ' ')
                    ch = this.buffer[++indent + offset];
                if (ch === '\r') {
                    const next = this.buffer[indent + offset + 1];
                    if (next === '\n' || (!next && !this.atEnd))
                        return offset + indent + 1;
                }
                return ch === '\n' || indent >= this.indentNext || (!ch && !this.atEnd)
                    ? offset + indent
                    : -1;
            }
            if (ch === '-' || ch === '.') {
                const dt = this.buffer.substr(offset, 3);
                if ((dt === '---' || dt === '...') && isEmpty(this.buffer[offset + 3]))
                    return -1;
            }
            return offset;
        }
        getLine() {
            let end = this.lineEndPos;
            if (typeof end !== 'number' || (end !== -1 && end < this.pos)) {
                end = this.buffer.indexOf('\n', this.pos);
                this.lineEndPos = end;
            }
            if (end === -1)
                return this.atEnd ? this.buffer.substring(this.pos) : null;
            if (this.buffer[end - 1] === '\r')
                end -= 1;
            return this.buffer.substring(this.pos, end);
        }
        hasChars(n) {
            return this.pos + n <= this.buffer.length;
        }
        setNext(state) {
            this.buffer = this.buffer.substring(this.pos);
            this.pos = 0;
            this.lineEndPos = null;
            this.next = state;
            return null;
        }
        peek(n) {
            return this.buffer.substr(this.pos, n);
        }
        *parseNext(next) {
            switch (next) {
                case 'stream':
                    return yield* this.parseStream();
                case 'line-start':
                    return yield* this.parseLineStart();
                case 'block-start':
                    return yield* this.parseBlockStart();
                case 'doc':
                    return yield* this.parseDocument();
                case 'flow':
                    return yield* this.parseFlowCollection();
                case 'quoted-scalar':
                    return yield* this.parseQuotedScalar();
                case 'block-scalar':
                    return yield* this.parseBlockScalar();
                case 'plain-scalar':
                    return yield* this.parsePlainScalar();
            }
        }
        *parseStream() {
            let line = this.getLine();
            if (line === null)
                return this.setNext('stream');
            if (line[0] === BOM) {
                yield* this.pushCount(1);
                line = line.substring(1);
            }
            if (line[0] === '%') {
                let dirEnd = line.length;
                const cs = line.indexOf('#');
                if (cs !== -1) {
                    const ch = line[cs - 1];
                    if (ch === ' ' || ch === '\t')
                        dirEnd = cs - 1;
                }
                while (true) {
                    const ch = line[dirEnd - 1];
                    if (ch === ' ' || ch === '\t')
                        dirEnd -= 1;
                    else
                        break;
                }
                const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
                yield* this.pushCount(line.length - n); // possible comment
                this.pushNewline();
                return 'stream';
            }
            if (this.atLineEnd()) {
                const sp = yield* this.pushSpaces(true);
                yield* this.pushCount(line.length - sp);
                yield* this.pushNewline();
                return 'stream';
            }
            yield DOCUMENT;
            return yield* this.parseLineStart();
        }
        *parseLineStart() {
            const ch = this.charAt(0);
            if (!ch && !this.atEnd)
                return this.setNext('line-start');
            if (ch === '-' || ch === '.') {
                if (!this.atEnd && !this.hasChars(4))
                    return this.setNext('line-start');
                const s = this.peek(3);
                if (s === '---' && isEmpty(this.charAt(3))) {
                    yield* this.pushCount(3);
                    this.indentValue = 0;
                    this.indentNext = 0;
                    return 'doc';
                }
                else if (s === '...' && isEmpty(this.charAt(3))) {
                    yield* this.pushCount(3);
                    return 'stream';
                }
            }
            this.indentValue = yield* this.pushSpaces(false);
            if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
                this.indentNext = this.indentValue;
            return yield* this.parseBlockStart();
        }
        *parseBlockStart() {
            const [ch0, ch1] = this.peek(2);
            if (!ch1 && !this.atEnd)
                return this.setNext('block-start');
            if ((ch0 === '-' || ch0 === '?' || ch0 === ':') && isEmpty(ch1)) {
                const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
                this.indentNext = this.indentValue + 1;
                this.indentValue += n;
                return yield* this.parseBlockStart();
            }
            return 'doc';
        }
        *parseDocument() {
            yield* this.pushSpaces(true);
            const line = this.getLine();
            if (line === null)
                return this.setNext('doc');
            let n = yield* this.pushIndicators();
            switch (line[n]) {
                case '#':
                    yield* this.pushCount(line.length - n);
                // fallthrough
                case undefined:
                    yield* this.pushNewline();
                    return yield* this.parseLineStart();
                case '{':
                case '[':
                    yield* this.pushCount(1);
                    this.flowKey = false;
                    this.flowLevel = 1;
                    return 'flow';
                case '}':
                case ']':
                    // this is an error
                    yield* this.pushCount(1);
                    return 'doc';
                case '*':
                    yield* this.pushUntil(isNotAnchorChar);
                    return 'doc';
                case '"':
                case "'":
                    return yield* this.parseQuotedScalar();
                case '|':
                case '>':
                    n += yield* this.parseBlockScalarHeader();
                    n += yield* this.pushSpaces(true);
                    yield* this.pushCount(line.length - n);
                    yield* this.pushNewline();
                    return yield* this.parseBlockScalar();
                default:
                    return yield* this.parsePlainScalar();
            }
        }
        *parseFlowCollection() {
            let nl, sp;
            let indent = -1;
            do {
                nl = yield* this.pushNewline();
                if (nl > 0) {
                    sp = yield* this.pushSpaces(false);
                    this.indentValue = indent = sp;
                }
                else {
                    sp = 0;
                }
                sp += yield* this.pushSpaces(true);
            } while (nl + sp > 0);
            const line = this.getLine();
            if (line === null)
                return this.setNext('flow');
            if ((indent !== -1 && indent < this.indentNext && line[0] !== '#') ||
                (indent === 0 &&
                    (line.startsWith('---') || line.startsWith('...')) &&
                    isEmpty(line[3]))) {
                // Allowing for the terminal ] or } at the same (rather than greater)
                // indent level as the initial [ or { is technically invalid, but
                // failing here would be surprising to users.
                const atFlowEndMarker = indent === this.indentNext - 1 &&
                    this.flowLevel === 1 &&
                    (line[0] === ']' || line[0] === '}');
                if (!atFlowEndMarker) {
                    // this is an error
                    this.flowLevel = 0;
                    yield FLOW_END;
                    return yield* this.parseLineStart();
                }
            }
            let n = 0;
            while (line[n] === ',') {
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                this.flowKey = false;
            }
            n += yield* this.pushIndicators();
            switch (line[n]) {
                case undefined:
                    return 'flow';
                case '#':
                    yield* this.pushCount(line.length - n);
                    return 'flow';
                case '{':
                case '[':
                    yield* this.pushCount(1);
                    this.flowKey = false;
                    this.flowLevel += 1;
                    return 'flow';
                case '}':
                case ']':
                    yield* this.pushCount(1);
                    this.flowKey = true;
                    this.flowLevel -= 1;
                    return this.flowLevel ? 'flow' : 'doc';
                case '*':
                    yield* this.pushUntil(isNotAnchorChar);
                    return 'flow';
                case '"':
                case "'":
                    this.flowKey = true;
                    return yield* this.parseQuotedScalar();
                case ':': {
                    const next = this.charAt(1);
                    if (this.flowKey || isEmpty(next) || next === ',') {
                        this.flowKey = false;
                        yield* this.pushCount(1);
                        yield* this.pushSpaces(true);
                        return 'flow';
                    }
                }
                // fallthrough
                default:
                    this.flowKey = false;
                    return yield* this.parsePlainScalar();
            }
        }
        *parseQuotedScalar() {
            const quote = this.charAt(0);
            let end = this.buffer.indexOf(quote, this.pos + 1);
            if (quote === "'") {
                while (end !== -1 && this.buffer[end + 1] === "'")
                    end = this.buffer.indexOf("'", end + 2);
            }
            else {
                // double-quote
                while (end !== -1) {
                    let n = 0;
                    while (this.buffer[end - 1 - n] === '\\')
                        n += 1;
                    if (n % 2 === 0)
                        break;
                    end = this.buffer.indexOf('"', end + 1);
                }
            }
            // Only looking for newlines within the quotes
            const qb = this.buffer.substring(0, end);
            let nl = qb.indexOf('\n', this.pos);
            if (nl !== -1) {
                while (nl !== -1) {
                    const cs = this.continueScalar(nl + 1);
                    if (cs === -1)
                        break;
                    nl = qb.indexOf('\n', cs);
                }
                if (nl !== -1) {
                    // this is an error caused by an unexpected unindent
                    end = nl - (qb[nl - 1] === '\r' ? 2 : 1);
                }
            }
            if (end === -1) {
                if (!this.atEnd)
                    return this.setNext('quoted-scalar');
                end = this.buffer.length;
            }
            yield* this.pushToIndex(end + 1, false);
            return this.flowLevel ? 'flow' : 'doc';
        }
        *parseBlockScalarHeader() {
            this.blockScalarIndent = -1;
            this.blockScalarKeep = false;
            let i = this.pos;
            while (true) {
                const ch = this.buffer[++i];
                if (ch === '+')
                    this.blockScalarKeep = true;
                else if (ch > '0' && ch <= '9')
                    this.blockScalarIndent = Number(ch) - 1;
                else if (ch !== '-')
                    break;
            }
            return yield* this.pushUntil(ch => isEmpty(ch) || ch === '#');
        }
        *parseBlockScalar() {
            let nl = this.pos - 1; // may be -1 if this.pos === 0
            let indent = 0;
            let ch;
            loop: for (let i = this.pos; (ch = this.buffer[i]); ++i) {
                switch (ch) {
                    case ' ':
                        indent += 1;
                        break;
                    case '\n':
                        nl = i;
                        indent = 0;
                        break;
                    case '\r': {
                        const next = this.buffer[i + 1];
                        if (!next && !this.atEnd)
                            return this.setNext('block-scalar');
                        if (next === '\n')
                            break;
                    } // fallthrough
                    default:
                        break loop;
                }
            }
            if (!ch && !this.atEnd)
                return this.setNext('block-scalar');
            if (indent >= this.indentNext) {
                if (this.blockScalarIndent === -1)
                    this.indentNext = indent;
                else
                    this.indentNext += this.blockScalarIndent;
                do {
                    const cs = this.continueScalar(nl + 1);
                    if (cs === -1)
                        break;
                    nl = this.buffer.indexOf('\n', cs);
                } while (nl !== -1);
                if (nl === -1) {
                    if (!this.atEnd)
                        return this.setNext('block-scalar');
                    nl = this.buffer.length;
                }
            }
            if (!this.blockScalarKeep) {
                do {
                    let i = nl - 1;
                    let ch = this.buffer[i];
                    if (ch === '\r')
                        ch = this.buffer[--i];
                    const lastChar = i; // Drop the line if last char not more indented
                    while (ch === ' ' || ch === '\t')
                        ch = this.buffer[--i];
                    if (ch === '\n' && i >= this.pos && i + 1 + indent > lastChar)
                        nl = i;
                    else
                        break;
                } while (true);
            }
            yield SCALAR;
            yield* this.pushToIndex(nl + 1, true);
            return yield* this.parseLineStart();
        }
        *parsePlainScalar() {
            const inFlow = this.flowLevel > 0;
            let end = this.pos - 1;
            let i = this.pos - 1;
            let ch;
            while ((ch = this.buffer[++i])) {
                if (ch === ':') {
                    const next = this.buffer[i + 1];
                    if (isEmpty(next) || (inFlow && next === ','))
                        break;
                    end = i;
                }
                else if (isEmpty(ch)) {
                    let next = this.buffer[i + 1];
                    if (ch === '\r') {
                        if (next === '\n') {
                            i += 1;
                            ch = '\n';
                            next = this.buffer[i + 1];
                        }
                        else
                            end = i;
                    }
                    if (next === '#' || (inFlow && invalidFlowScalarChars.includes(next)))
                        break;
                    if (ch === '\n') {
                        const cs = this.continueScalar(i + 1);
                        if (cs === -1)
                            break;
                        i = Math.max(i, cs - 2); // to advance, but still account for ' #'
                    }
                }
                else {
                    if (inFlow && invalidFlowScalarChars.includes(ch))
                        break;
                    end = i;
                }
            }
            if (!ch && !this.atEnd)
                return this.setNext('plain-scalar');
            yield SCALAR;
            yield* this.pushToIndex(end + 1, true);
            return inFlow ? 'flow' : 'doc';
        }
        *pushCount(n) {
            if (n > 0) {
                yield this.buffer.substr(this.pos, n);
                this.pos += n;
                return n;
            }
            return 0;
        }
        *pushToIndex(i, allowEmpty) {
            const s = this.buffer.slice(this.pos, i);
            if (s) {
                yield s;
                this.pos += s.length;
                return s.length;
            }
            else if (allowEmpty)
                yield '';
            return 0;
        }
        *pushIndicators() {
            switch (this.charAt(0)) {
                case '!':
                    return ((yield* this.pushTag()) +
                        (yield* this.pushSpaces(true)) +
                        (yield* this.pushIndicators()));
                case '&':
                    return ((yield* this.pushUntil(isNotAnchorChar)) +
                        (yield* this.pushSpaces(true)) +
                        (yield* this.pushIndicators()));
                case '-': // this is an error
                case '?': // this is an error outside flow collections
                case ':': {
                    const inFlow = this.flowLevel > 0;
                    const ch1 = this.charAt(1);
                    if (isEmpty(ch1) || (inFlow && invalidFlowScalarChars.includes(ch1))) {
                        if (!inFlow)
                            this.indentNext = this.indentValue + 1;
                        else if (this.flowKey)
                            this.flowKey = false;
                        return ((yield* this.pushCount(1)) +
                            (yield* this.pushSpaces(true)) +
                            (yield* this.pushIndicators()));
                    }
                }
            }
            return 0;
        }
        *pushTag() {
            if (this.charAt(1) === '<') {
                let i = this.pos + 2;
                let ch = this.buffer[i];
                while (!isEmpty(ch) && ch !== '>')
                    ch = this.buffer[++i];
                return yield* this.pushToIndex(ch === '>' ? i + 1 : i, false);
            }
            else {
                let i = this.pos + 1;
                let ch = this.buffer[i];
                while (ch) {
                    if (tagChars.includes(ch))
                        ch = this.buffer[++i];
                    else if (ch === '%' &&
                        hexDigits.includes(this.buffer[i + 1]) &&
                        hexDigits.includes(this.buffer[i + 2])) {
                        ch = this.buffer[(i += 3)];
                    }
                    else
                        break;
                }
                return yield* this.pushToIndex(i, false);
            }
        }
        *pushNewline() {
            const ch = this.buffer[this.pos];
            if (ch === '\n')
                return yield* this.pushCount(1);
            else if (ch === '\r' && this.charAt(1) === '\n')
                return yield* this.pushCount(2);
            else
                return 0;
        }
        *pushSpaces(allowTabs) {
            let i = this.pos - 1;
            let ch;
            do {
                ch = this.buffer[++i];
            } while (ch === ' ' || (allowTabs && ch === '\t'));
            const n = i - this.pos;
            if (n > 0) {
                yield this.buffer.substr(this.pos, n);
                this.pos = i;
            }
            return n;
        }
        *pushUntil(test) {
            let i = this.pos;
            let ch = this.buffer[i];
            while (!test(ch))
                ch = this.buffer[++i];
            return yield* this.pushToIndex(i, false);
        }
    }

    /**
     * Tracks newlines during parsing in order to provide an efficient API for
     * determining the one-indexed `{ line, col }` position for any offset
     * within the input.
     */
    class LineCounter {
        constructor() {
            this.lineStarts = [];
            /**
             * Should be called in ascending order. Otherwise, call
             * `lineCounter.lineStarts.sort()` before calling `linePos()`.
             */
            this.addNewLine = (offset) => this.lineStarts.push(offset);
            /**
             * Performs a binary search and returns the 1-indexed { line, col }
             * position of `offset`. If `line === 0`, `addNewLine` has never been
             * called or `offset` is before the first known newline.
             */
            this.linePos = (offset) => {
                let low = 0;
                let high = this.lineStarts.length;
                while (low < high) {
                    const mid = (low + high) >> 1; // Math.floor((low + high) / 2)
                    if (this.lineStarts[mid] < offset)
                        low = mid + 1;
                    else
                        high = mid;
                }
                if (this.lineStarts[low] === offset)
                    return { line: low + 1, col: 1 };
                if (low === 0)
                    return { line: 0, col: offset };
                const start = this.lineStarts[low - 1];
                return { line: low, col: offset - start + 1 };
            };
        }
    }

    function includesToken(list, type) {
        for (let i = 0; i < list.length; ++i)
            if (list[i].type === type)
                return true;
        return false;
    }
    function findNonEmptyIndex(list) {
        for (let i = 0; i < list.length; ++i) {
            switch (list[i].type) {
                case 'space':
                case 'comment':
                case 'newline':
                    break;
                default:
                    return i;
            }
        }
        return -1;
    }
    function isFlowToken(token) {
        switch (token?.type) {
            case 'alias':
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
            case 'flow-collection':
                return true;
            default:
                return false;
        }
    }
    function getPrevProps(parent) {
        switch (parent.type) {
            case 'document':
                return parent.start;
            case 'block-map': {
                const it = parent.items[parent.items.length - 1];
                return it.sep ?? it.start;
            }
            case 'block-seq':
                return parent.items[parent.items.length - 1].start;
            /* istanbul ignore next should not happen */
            default:
                return [];
        }
    }
    /** Note: May modify input array */
    function getFirstKeyStartProps(prev) {
        if (prev.length === 0)
            return [];
        let i = prev.length;
        loop: while (--i >= 0) {
            switch (prev[i].type) {
                case 'doc-start':
                case 'explicit-key-ind':
                case 'map-value-ind':
                case 'seq-item-ind':
                case 'newline':
                    break loop;
            }
        }
        while (prev[++i]?.type === 'space') {
            /* loop */
        }
        return prev.splice(i, prev.length);
    }
    function fixFlowSeqItems(fc) {
        if (fc.start.type === 'flow-seq-start') {
            for (const it of fc.items) {
                if (it.sep &&
                    !it.value &&
                    !includesToken(it.start, 'explicit-key-ind') &&
                    !includesToken(it.sep, 'map-value-ind')) {
                    if (it.key)
                        it.value = it.key;
                    delete it.key;
                    if (isFlowToken(it.value)) {
                        if (it.value.end)
                            Array.prototype.push.apply(it.value.end, it.sep);
                        else
                            it.value.end = it.sep;
                    }
                    else
                        Array.prototype.push.apply(it.start, it.sep);
                    delete it.sep;
                }
            }
        }
    }
    /**
     * A YAML concrete syntax tree (CST) parser
     *
     * ```ts
     * const src: string = ...
     * for (const token of new Parser().parse(src)) {
     *   // token: Token
     * }
     * ```
     *
     * To use the parser with a user-provided lexer:
     *
     * ```ts
     * function* parse(source: string, lexer: Lexer) {
     *   const parser = new Parser()
     *   for (const lexeme of lexer.lex(source))
     *     yield* parser.next(lexeme)
     *   yield* parser.end()
     * }
     *
     * const src: string = ...
     * const lexer = new Lexer()
     * for (const token of parse(src, lexer)) {
     *   // token: Token
     * }
     * ```
     */
    class Parser {
        /**
         * @param onNewLine - If defined, called separately with the start position of
         *   each new line (in `parse()`, including the start of input).
         */
        constructor(onNewLine) {
            /** If true, space and sequence indicators count as indentation */
            this.atNewLine = true;
            /** If true, next token is a scalar value */
            this.atScalar = false;
            /** Current indentation level */
            this.indent = 0;
            /** Current offset since the start of parsing */
            this.offset = 0;
            /** On the same line with a block map key */
            this.onKeyLine = false;
            /** Top indicates the node that's currently being built */
            this.stack = [];
            /** The source of the current token, set in parse() */
            this.source = '';
            /** The type of the current token, set in parse() */
            this.type = '';
            // Must be defined after `next()`
            this.lexer = new Lexer();
            this.onNewLine = onNewLine;
        }
        /**
         * Parse `source` as a YAML stream.
         * If `incomplete`, a part of the last line may be left as a buffer for the next call.
         *
         * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
         *
         * @returns A generator of tokens representing each directive, document, and other structure.
         */
        *parse(source, incomplete = false) {
            if (this.onNewLine && this.offset === 0)
                this.onNewLine(0);
            for (const lexeme of this.lexer.lex(source, incomplete))
                yield* this.next(lexeme);
            if (!incomplete)
                yield* this.end();
        }
        /**
         * Advance the parser by the `source` of one lexical token.
         */
        *next(source) {
            this.source = source;
            if (this.atScalar) {
                this.atScalar = false;
                yield* this.step();
                this.offset += source.length;
                return;
            }
            const type = tokenType(source);
            if (!type) {
                const message = `Not a YAML token: ${source}`;
                yield* this.pop({ type: 'error', offset: this.offset, message, source });
                this.offset += source.length;
            }
            else if (type === 'scalar') {
                this.atNewLine = false;
                this.atScalar = true;
                this.type = 'scalar';
            }
            else {
                this.type = type;
                yield* this.step();
                switch (type) {
                    case 'newline':
                        this.atNewLine = true;
                        this.indent = 0;
                        if (this.onNewLine)
                            this.onNewLine(this.offset + source.length);
                        break;
                    case 'space':
                        if (this.atNewLine && source[0] === ' ')
                            this.indent += source.length;
                        break;
                    case 'explicit-key-ind':
                    case 'map-value-ind':
                    case 'seq-item-ind':
                        if (this.atNewLine)
                            this.indent += source.length;
                        break;
                    case 'doc-mode':
                    case 'flow-error-end':
                        return;
                    default:
                        this.atNewLine = false;
                }
                this.offset += source.length;
            }
        }
        /** Call at end of input to push out any remaining constructions */
        *end() {
            while (this.stack.length > 0)
                yield* this.pop();
        }
        get sourceToken() {
            const st = {
                type: this.type,
                offset: this.offset,
                indent: this.indent,
                source: this.source
            };
            return st;
        }
        *step() {
            const top = this.peek(1);
            if (this.type === 'doc-end' && (!top || top.type !== 'doc-end')) {
                while (this.stack.length > 0)
                    yield* this.pop();
                this.stack.push({
                    type: 'doc-end',
                    offset: this.offset,
                    source: this.source
                });
                return;
            }
            if (!top)
                return yield* this.stream();
            switch (top.type) {
                case 'document':
                    return yield* this.document(top);
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar':
                    return yield* this.scalar(top);
                case 'block-scalar':
                    return yield* this.blockScalar(top);
                case 'block-map':
                    return yield* this.blockMap(top);
                case 'block-seq':
                    return yield* this.blockSequence(top);
                case 'flow-collection':
                    return yield* this.flowCollection(top);
                case 'doc-end':
                    return yield* this.documentEnd(top);
            }
            /* istanbul ignore next should not happen */
            yield* this.pop();
        }
        peek(n) {
            return this.stack[this.stack.length - n];
        }
        *pop(error) {
            const token = error ?? this.stack.pop();
            /* istanbul ignore if should not happen */
            if (!token) {
                const message = 'Tried to pop an empty stack';
                yield { type: 'error', offset: this.offset, source: '', message };
            }
            else if (this.stack.length === 0) {
                yield token;
            }
            else {
                const top = this.peek(1);
                if (token.type === 'block-scalar') {
                    // Block scalars use their parent rather than header indent
                    token.indent = 'indent' in top ? top.indent : 0;
                }
                else if (token.type === 'flow-collection' && top.type === 'document') {
                    // Ignore all indent for top-level flow collections
                    token.indent = 0;
                }
                if (token.type === 'flow-collection')
                    fixFlowSeqItems(token);
                switch (top.type) {
                    case 'document':
                        top.value = token;
                        break;
                    case 'block-scalar':
                        top.props.push(token); // error
                        break;
                    case 'block-map': {
                        const it = top.items[top.items.length - 1];
                        if (it.value) {
                            top.items.push({ start: [], key: token, sep: [] });
                            this.onKeyLine = true;
                            return;
                        }
                        else if (it.sep) {
                            it.value = token;
                        }
                        else {
                            Object.assign(it, { key: token, sep: [] });
                            this.onKeyLine = !includesToken(it.start, 'explicit-key-ind');
                            return;
                        }
                        break;
                    }
                    case 'block-seq': {
                        const it = top.items[top.items.length - 1];
                        if (it.value)
                            top.items.push({ start: [], value: token });
                        else
                            it.value = token;
                        break;
                    }
                    case 'flow-collection': {
                        const it = top.items[top.items.length - 1];
                        if (!it || it.value)
                            top.items.push({ start: [], key: token, sep: [] });
                        else if (it.sep)
                            it.value = token;
                        else
                            Object.assign(it, { key: token, sep: [] });
                        return;
                    }
                    /* istanbul ignore next should not happen */
                    default:
                        yield* this.pop();
                        yield* this.pop(token);
                }
                if ((top.type === 'document' ||
                    top.type === 'block-map' ||
                    top.type === 'block-seq') &&
                    (token.type === 'block-map' || token.type === 'block-seq')) {
                    const last = token.items[token.items.length - 1];
                    if (last &&
                        !last.sep &&
                        !last.value &&
                        last.start.length > 0 &&
                        findNonEmptyIndex(last.start) === -1 &&
                        (token.indent === 0 ||
                            last.start.every(st => st.type !== 'comment' || st.indent < token.indent))) {
                        if (top.type === 'document')
                            top.end = last.start;
                        else
                            top.items.push({ start: last.start });
                        token.items.splice(-1, 1);
                    }
                }
            }
        }
        *stream() {
            switch (this.type) {
                case 'directive-line':
                    yield { type: 'directive', offset: this.offset, source: this.source };
                    return;
                case 'byte-order-mark':
                case 'space':
                case 'comment':
                case 'newline':
                    yield this.sourceToken;
                    return;
                case 'doc-mode':
                case 'doc-start': {
                    const doc = {
                        type: 'document',
                        offset: this.offset,
                        start: []
                    };
                    if (this.type === 'doc-start')
                        doc.start.push(this.sourceToken);
                    this.stack.push(doc);
                    return;
                }
            }
            yield {
                type: 'error',
                offset: this.offset,
                message: `Unexpected ${this.type} token in YAML stream`,
                source: this.source
            };
        }
        *document(doc) {
            if (doc.value)
                return yield* this.lineEnd(doc);
            switch (this.type) {
                case 'doc-start': {
                    if (findNonEmptyIndex(doc.start) !== -1) {
                        yield* this.pop();
                        yield* this.step();
                    }
                    else
                        doc.start.push(this.sourceToken);
                    return;
                }
                case 'anchor':
                case 'tag':
                case 'space':
                case 'comment':
                case 'newline':
                    doc.start.push(this.sourceToken);
                    return;
            }
            const bv = this.startBlockValue(doc);
            if (bv)
                this.stack.push(bv);
            else {
                yield {
                    type: 'error',
                    offset: this.offset,
                    message: `Unexpected ${this.type} token in YAML document`,
                    source: this.source
                };
            }
        }
        *scalar(scalar) {
            if (this.type === 'map-value-ind') {
                const prev = getPrevProps(this.peek(2));
                const start = getFirstKeyStartProps(prev);
                let sep;
                if (scalar.end) {
                    sep = scalar.end;
                    sep.push(this.sourceToken);
                    delete scalar.end;
                }
                else
                    sep = [this.sourceToken];
                const map = {
                    type: 'block-map',
                    offset: scalar.offset,
                    indent: scalar.indent,
                    items: [{ start, key: scalar, sep }]
                };
                this.onKeyLine = true;
                this.stack[this.stack.length - 1] = map;
            }
            else
                yield* this.lineEnd(scalar);
        }
        *blockScalar(scalar) {
            switch (this.type) {
                case 'space':
                case 'comment':
                case 'newline':
                    scalar.props.push(this.sourceToken);
                    return;
                case 'scalar':
                    scalar.source = this.source;
                    // block-scalar source includes trailing newline
                    this.atNewLine = true;
                    this.indent = 0;
                    if (this.onNewLine) {
                        let nl = this.source.indexOf('\n') + 1;
                        while (nl !== 0) {
                            this.onNewLine(this.offset + nl);
                            nl = this.source.indexOf('\n', nl) + 1;
                        }
                    }
                    yield* this.pop();
                    break;
                /* istanbul ignore next should not happen */
                default:
                    yield* this.pop();
                    yield* this.step();
            }
        }
        *blockMap(map) {
            const it = map.items[map.items.length - 1];
            // it.sep is true-ish if pair already has key or : separator
            switch (this.type) {
                case 'newline':
                    this.onKeyLine = false;
                    if (it.value) {
                        const end = 'end' in it.value ? it.value.end : undefined;
                        const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                        if (last?.type === 'comment')
                            end?.push(this.sourceToken);
                        else
                            map.items.push({ start: [this.sourceToken] });
                    }
                    else if (it.sep) {
                        it.sep.push(this.sourceToken);
                    }
                    else {
                        it.start.push(this.sourceToken);
                    }
                    return;
                case 'space':
                case 'comment':
                    if (it.value) {
                        map.items.push({ start: [this.sourceToken] });
                    }
                    else if (it.sep) {
                        it.sep.push(this.sourceToken);
                    }
                    else {
                        if (this.atIndentedComment(it.start, map.indent)) {
                            const prev = map.items[map.items.length - 2];
                            const end = prev?.value?.end;
                            if (Array.isArray(end)) {
                                Array.prototype.push.apply(end, it.start);
                                end.push(this.sourceToken);
                                map.items.pop();
                                return;
                            }
                        }
                        it.start.push(this.sourceToken);
                    }
                    return;
            }
            if (this.indent >= map.indent) {
                const atNextItem = !this.onKeyLine && this.indent === map.indent && it.sep;
                // For empty nodes, assign newline-separated not indented empty tokens to following node
                let start = [];
                if (atNextItem && it.sep && !it.value) {
                    const nl = [];
                    for (let i = 0; i < it.sep.length; ++i) {
                        const st = it.sep[i];
                        switch (st.type) {
                            case 'newline':
                                nl.push(i);
                                break;
                            case 'space':
                                break;
                            case 'comment':
                                if (st.indent > map.indent)
                                    nl.length = 0;
                                break;
                            default:
                                nl.length = 0;
                        }
                    }
                    if (nl.length >= 2)
                        start = it.sep.splice(nl[1]);
                }
                switch (this.type) {
                    case 'anchor':
                    case 'tag':
                        if (atNextItem || it.value) {
                            start.push(this.sourceToken);
                            map.items.push({ start });
                            this.onKeyLine = true;
                        }
                        else if (it.sep) {
                            it.sep.push(this.sourceToken);
                        }
                        else {
                            it.start.push(this.sourceToken);
                        }
                        return;
                    case 'explicit-key-ind':
                        if (!it.sep && !includesToken(it.start, 'explicit-key-ind')) {
                            it.start.push(this.sourceToken);
                        }
                        else if (atNextItem || it.value) {
                            start.push(this.sourceToken);
                            map.items.push({ start });
                        }
                        else {
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start: [this.sourceToken] }]
                            });
                        }
                        this.onKeyLine = true;
                        return;
                    case 'map-value-ind':
                        if (includesToken(it.start, 'explicit-key-ind')) {
                            if (!it.sep) {
                                if (includesToken(it.start, 'newline')) {
                                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                                }
                                else {
                                    const start = getFirstKeyStartProps(it.start);
                                    this.stack.push({
                                        type: 'block-map',
                                        offset: this.offset,
                                        indent: this.indent,
                                        items: [{ start, key: null, sep: [this.sourceToken] }]
                                    });
                                }
                            }
                            else if (it.value) {
                                map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                            }
                            else if (includesToken(it.sep, 'map-value-ind')) {
                                this.stack.push({
                                    type: 'block-map',
                                    offset: this.offset,
                                    indent: this.indent,
                                    items: [{ start, key: null, sep: [this.sourceToken] }]
                                });
                            }
                            else if (isFlowToken(it.key) &&
                                !includesToken(it.sep, 'newline')) {
                                const start = getFirstKeyStartProps(it.start);
                                const key = it.key;
                                const sep = it.sep;
                                sep.push(this.sourceToken);
                                // @ts-expect-error type guard is wrong here
                                delete it.key, delete it.sep;
                                this.stack.push({
                                    type: 'block-map',
                                    offset: this.offset,
                                    indent: this.indent,
                                    items: [{ start, key, sep }]
                                });
                            }
                            else if (start.length > 0) {
                                // Not actually at next item
                                it.sep = it.sep.concat(start, this.sourceToken);
                            }
                            else {
                                it.sep.push(this.sourceToken);
                            }
                        }
                        else {
                            if (!it.sep) {
                                Object.assign(it, { key: null, sep: [this.sourceToken] });
                            }
                            else if (it.value || atNextItem) {
                                map.items.push({ start, key: null, sep: [this.sourceToken] });
                            }
                            else if (includesToken(it.sep, 'map-value-ind')) {
                                this.stack.push({
                                    type: 'block-map',
                                    offset: this.offset,
                                    indent: this.indent,
                                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                                });
                            }
                            else {
                                it.sep.push(this.sourceToken);
                            }
                        }
                        this.onKeyLine = true;
                        return;
                    case 'alias':
                    case 'scalar':
                    case 'single-quoted-scalar':
                    case 'double-quoted-scalar': {
                        const fs = this.flowScalar(this.type);
                        if (atNextItem || it.value) {
                            map.items.push({ start, key: fs, sep: [] });
                            this.onKeyLine = true;
                        }
                        else if (it.sep) {
                            this.stack.push(fs);
                        }
                        else {
                            Object.assign(it, { key: fs, sep: [] });
                            this.onKeyLine = true;
                        }
                        return;
                    }
                    default: {
                        const bv = this.startBlockValue(map);
                        if (bv) {
                            if (atNextItem &&
                                bv.type !== 'block-seq' &&
                                includesToken(it.start, 'explicit-key-ind')) {
                                map.items.push({ start });
                            }
                            this.stack.push(bv);
                            return;
                        }
                    }
                }
            }
            yield* this.pop();
            yield* this.step();
        }
        *blockSequence(seq) {
            const it = seq.items[seq.items.length - 1];
            switch (this.type) {
                case 'newline':
                    if (it.value) {
                        const end = 'end' in it.value ? it.value.end : undefined;
                        const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                        if (last?.type === 'comment')
                            end?.push(this.sourceToken);
                        else
                            seq.items.push({ start: [this.sourceToken] });
                    }
                    else
                        it.start.push(this.sourceToken);
                    return;
                case 'space':
                case 'comment':
                    if (it.value)
                        seq.items.push({ start: [this.sourceToken] });
                    else {
                        if (this.atIndentedComment(it.start, seq.indent)) {
                            const prev = seq.items[seq.items.length - 2];
                            const end = prev?.value?.end;
                            if (Array.isArray(end)) {
                                Array.prototype.push.apply(end, it.start);
                                end.push(this.sourceToken);
                                seq.items.pop();
                                return;
                            }
                        }
                        it.start.push(this.sourceToken);
                    }
                    return;
                case 'anchor':
                case 'tag':
                    if (it.value || this.indent <= seq.indent)
                        break;
                    it.start.push(this.sourceToken);
                    return;
                case 'seq-item-ind':
                    if (this.indent !== seq.indent)
                        break;
                    if (it.value || includesToken(it.start, 'seq-item-ind'))
                        seq.items.push({ start: [this.sourceToken] });
                    else
                        it.start.push(this.sourceToken);
                    return;
            }
            if (this.indent > seq.indent) {
                const bv = this.startBlockValue(seq);
                if (bv) {
                    this.stack.push(bv);
                    return;
                }
            }
            yield* this.pop();
            yield* this.step();
        }
        *flowCollection(fc) {
            const it = fc.items[fc.items.length - 1];
            if (this.type === 'flow-error-end') {
                let top;
                do {
                    yield* this.pop();
                    top = this.peek(1);
                } while (top && top.type === 'flow-collection');
            }
            else if (fc.end.length === 0) {
                switch (this.type) {
                    case 'comma':
                    case 'explicit-key-ind':
                        if (!it || it.sep)
                            fc.items.push({ start: [this.sourceToken] });
                        else
                            it.start.push(this.sourceToken);
                        return;
                    case 'map-value-ind':
                        if (!it || it.value)
                            fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
                        else if (it.sep)
                            it.sep.push(this.sourceToken);
                        else
                            Object.assign(it, { key: null, sep: [this.sourceToken] });
                        return;
                    case 'space':
                    case 'comment':
                    case 'newline':
                    case 'anchor':
                    case 'tag':
                        if (!it || it.value)
                            fc.items.push({ start: [this.sourceToken] });
                        else if (it.sep)
                            it.sep.push(this.sourceToken);
                        else
                            it.start.push(this.sourceToken);
                        return;
                    case 'alias':
                    case 'scalar':
                    case 'single-quoted-scalar':
                    case 'double-quoted-scalar': {
                        const fs = this.flowScalar(this.type);
                        if (!it || it.value)
                            fc.items.push({ start: [], key: fs, sep: [] });
                        else if (it.sep)
                            this.stack.push(fs);
                        else
                            Object.assign(it, { key: fs, sep: [] });
                        return;
                    }
                    case 'flow-map-end':
                    case 'flow-seq-end':
                        fc.end.push(this.sourceToken);
                        return;
                }
                const bv = this.startBlockValue(fc);
                /* istanbul ignore else should not happen */
                if (bv)
                    this.stack.push(bv);
                else {
                    yield* this.pop();
                    yield* this.step();
                }
            }
            else {
                const parent = this.peek(2);
                if (parent.type === 'block-map' &&
                    ((this.type === 'map-value-ind' && parent.indent === fc.indent) ||
                        (this.type === 'newline' &&
                            !parent.items[parent.items.length - 1].sep))) {
                    yield* this.pop();
                    yield* this.step();
                }
                else if (this.type === 'map-value-ind' &&
                    parent.type !== 'flow-collection') {
                    const prev = getPrevProps(parent);
                    const start = getFirstKeyStartProps(prev);
                    fixFlowSeqItems(fc);
                    const sep = fc.end.splice(1, fc.end.length);
                    sep.push(this.sourceToken);
                    const map = {
                        type: 'block-map',
                        offset: fc.offset,
                        indent: fc.indent,
                        items: [{ start, key: fc, sep }]
                    };
                    this.onKeyLine = true;
                    this.stack[this.stack.length - 1] = map;
                }
                else {
                    yield* this.lineEnd(fc);
                }
            }
        }
        flowScalar(type) {
            if (this.onNewLine) {
                let nl = this.source.indexOf('\n') + 1;
                while (nl !== 0) {
                    this.onNewLine(this.offset + nl);
                    nl = this.source.indexOf('\n', nl) + 1;
                }
            }
            return {
                type,
                offset: this.offset,
                indent: this.indent,
                source: this.source
            };
        }
        startBlockValue(parent) {
            switch (this.type) {
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar':
                    return this.flowScalar(this.type);
                case 'block-scalar-header':
                    return {
                        type: 'block-scalar',
                        offset: this.offset,
                        indent: this.indent,
                        props: [this.sourceToken],
                        source: ''
                    };
                case 'flow-map-start':
                case 'flow-seq-start':
                    return {
                        type: 'flow-collection',
                        offset: this.offset,
                        indent: this.indent,
                        start: this.sourceToken,
                        items: [],
                        end: []
                    };
                case 'seq-item-ind':
                    return {
                        type: 'block-seq',
                        offset: this.offset,
                        indent: this.indent,
                        items: [{ start: [this.sourceToken] }]
                    };
                case 'explicit-key-ind': {
                    this.onKeyLine = true;
                    const prev = getPrevProps(parent);
                    const start = getFirstKeyStartProps(prev);
                    start.push(this.sourceToken);
                    return {
                        type: 'block-map',
                        offset: this.offset,
                        indent: this.indent,
                        items: [{ start }]
                    };
                }
                case 'map-value-ind': {
                    this.onKeyLine = true;
                    const prev = getPrevProps(parent);
                    const start = getFirstKeyStartProps(prev);
                    return {
                        type: 'block-map',
                        offset: this.offset,
                        indent: this.indent,
                        items: [{ start, key: null, sep: [this.sourceToken] }]
                    };
                }
            }
            return null;
        }
        atIndentedComment(start, indent) {
            if (this.type !== 'comment')
                return false;
            if (this.indent <= indent)
                return false;
            return start.every(st => st.type === 'newline' || st.type === 'space');
        }
        *documentEnd(docEnd) {
            if (this.type !== 'doc-mode') {
                if (docEnd.end)
                    docEnd.end.push(this.sourceToken);
                else
                    docEnd.end = [this.sourceToken];
                if (this.type === 'newline')
                    yield* this.pop();
            }
        }
        *lineEnd(token) {
            switch (this.type) {
                case 'comma':
                case 'doc-start':
                case 'doc-end':
                case 'flow-seq-end':
                case 'flow-map-end':
                case 'map-value-ind':
                    yield* this.pop();
                    yield* this.step();
                    break;
                case 'newline':
                    this.onKeyLine = false;
                // fallthrough
                case 'space':
                case 'comment':
                default:
                    // all other values are errors
                    if (token.end)
                        token.end.push(this.sourceToken);
                    else
                        token.end = [this.sourceToken];
                    if (this.type === 'newline')
                        yield* this.pop();
            }
        }
    }

    function parseOptions(options) {
        const prettyErrors = options.prettyErrors !== false;
        const lineCounter = options.lineCounter || (prettyErrors && new LineCounter()) || null;
        return { lineCounter, prettyErrors };
    }
    /** Parse an input string into a single YAML.Document */
    function parseDocument(source, options = {}) {
        const { lineCounter, prettyErrors } = parseOptions(options);
        const parser = new Parser(lineCounter?.addNewLine);
        const composer = new Composer(options);
        // `doc` is always set by compose.end(true) at the very latest
        let doc = null;
        for (const _doc of composer.compose(parser.parse(source), true, source.length)) {
            if (!doc)
                doc = _doc;
            else if (doc.options.logLevel !== 'silent') {
                doc.errors.push(new YAMLParseError(_doc.range.slice(0, 2), 'MULTIPLE_DOCS', 'Source contains multiple documents; please use YAML.parseAllDocuments()'));
                break;
            }
        }
        if (prettyErrors && lineCounter) {
            doc.errors.forEach(prettifyError(source, lineCounter));
            doc.warnings.forEach(prettifyError(source, lineCounter));
        }
        return doc;
    }
    function parse(src, reviver, options) {
        let _reviver = undefined;
        if (typeof reviver === 'function') {
            _reviver = reviver;
        }
        else if (options === undefined && reviver && typeof reviver === 'object') {
            options = reviver;
        }
        const doc = parseDocument(src, options);
        if (!doc)
            return null;
        doc.warnings.forEach(warning => warn(doc.options.logLevel, warning));
        if (doc.errors.length > 0) {
            if (doc.options.logLevel !== 'silent')
                throw doc.errors[0];
            else
                doc.errors = [];
        }
        return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }

    const _default = {
        title: "",
        page_title: "",
        sections: {
            introduction: {
                title: "",
                subsections: {
                    introduction: {
                        title: "",
                        text: ""
                    }
                }
            },
            instruction_set: {
                title: "",
                subsections: {
                    instruction_set: {
                        title: ""
                    },
                    instruction_structure: {
                        title: "",
                        opcode_desc: "",
                        immediate_flag_desc: "",
                        operand_desc: ""
                    },
                    addressing_modes: {
                        title: "",
                        subsections: {
                            immediate: {
                                title: "",
                                paragraphs: []
                            },
                            direct: {
                                title: "",
                                paragraphs: []
                            }
                        }
                    }
                }
            },
            keyboard_shortcuts: {
                title: "",
                subsections: {
                    keyboard_shortcuts: {
                        title: ""
                    }
                }
            },
            code_files: {
                title: "",
                subsections: {
                    code_files: {
                        title: "",
                        paragraphs: []
                    },
                    new_lines: {
                        title: "",
                        paragraphs: []
                    },
                    syntax: {
                        title: "",
                        paragraphs: []
                    }
                }
            },
            ui: {
                title: ""
            },
            examples: {
                title: "",
                subsections: {
                    if_then_else: {
                        title: ""
                    },
                    do_while: {
                        title: ""
                    }
                }
            }
        },
        opcodes_table: {
            sections_titles: {
                control_flow: "",
                data_flow: "",
                arithmetic_logic: ""
            },
            descriptions: {
                NOP: "",
                HLT: "",
                JMP: "",
                JZ: "",
                JNZ: "",
                JN: "",
                JNN: "",
                LOD: "",
                STO: "",
                ADD: "",
                SUB: "",
                MUL: "",
                DIV: "",
                AND: "",
                CMP: "",
                NOT: ""
            }
        },
        shortcuts_table: {
            ram_editing: {
                title: "",
                headers: {
                    keys: "",
                    condition: "",
                    description: ""
                },
                shortcuts: [
                    {
                        keys: "",
                        condition: "",
                        description: ""
                    }
                ]
            }
        }
    };
    const text = writable(_default);
    function fetchText(_lang) {
        fetch(`resources/i18n/manual/${_lang}.yaml`)
            .then(res => res.text())
            .then(text => parse(text))
            .then(data => text.set(data));
    }
    function init() {
        fetchText(get_store_value(language));
        language.subscribe(fetchText);
    }

    /* src\manual\components\Header.svelte generated by Svelte v3.55.0 */
    const file$a = "src\\manual\\components\\Header.svelte";

    function create_fragment$f(ctx) {
    	let header;
    	let h1;
    	let t0_value = /*$text*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let languageselect;
    	let updating_value;
    	let current;

    	function languageselect_value_binding(value) {
    		/*languageselect_value_binding*/ ctx[2](value);
    	}

    	let languageselect_props = {};

    	if (/*$language*/ ctx[1] !== void 0) {
    		languageselect_props.value = /*$language*/ ctx[1];
    	}

    	languageselect = new LanguageSelect({
    			props: languageselect_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(languageselect, 'value', languageselect_value_binding, /*$language*/ ctx[1]));

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			t0 = text$1(t0_value);
    			t1 = space();
    			create_component(languageselect.$$.fragment);
    			attr_dev(h1, "class", "text-4xl font-bold text-left");
    			add_location(h1, file$a, 6, 1, 285);
    			attr_dev(header, "class", "px-7 py-4 border-b border-gray-500 flex items-center justify-between");
    			add_location(header, file$a, 5, 0, 198);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(h1, t0);
    			append_dev(header, t1);
    			mount_component(languageselect, header, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$text*/ 1) && t0_value !== (t0_value = /*$text*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			const languageselect_changes = {};

    			if (!updating_value && dirty & /*$language*/ 2) {
    				updating_value = true;
    				languageselect_changes.value = /*$language*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			languageselect.$set(languageselect_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(languageselect.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(languageselect.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(languageselect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $text;
    	let $language;
    	validate_store(text, 'text');
    	component_subscribe($$self, text, $$value => $$invalidate(0, $text = $$value));
    	validate_store(language, 'language');
    	component_subscribe($$self, language, $$value => $$invalidate(1, $language = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function languageselect_value_binding(value) {
    		$language = value;
    		language.set($language);
    	}

    	$$self.$capture_state = () => ({
    		LanguageSelect,
    		language,
    		text,
    		$text,
    		$language
    	});

    	return [$text, $language, languageselect_value_binding];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\shared\components\tabs\TabGroup.svelte generated by Svelte v3.55.0 */

    // (4:0) <TabGroup class="grid grid-cols-tabgroup gap-x-4 {$$props.class}" vertical>
    function create_default_slot$a(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(4:0) <TabGroup class=\\\"grid grid-cols-tabgroup gap-x-4 {$$props.class}\\\" vertical>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let tabgroup;
    	let current;

    	tabgroup = new TabGroup({
    			props: {
    				class: "grid grid-cols-tabgroup gap-x-4 " + /*$$props*/ ctx[0].class,
    				vertical: true,
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabgroup_changes = {};
    			if (dirty & /*$$props*/ 1) tabgroup_changes.class = "grid grid-cols-tabgroup gap-x-4 " + /*$$props*/ ctx[0].class;

    			if (dirty & /*$$scope*/ 4) {
    				tabgroup_changes.$$scope = { dirty, ctx };
    			}

    			tabgroup.$set(tabgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabGroup', slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ TabGroup });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, slots, $$scope];
    }

    class TabGroup_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabGroup_1",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\shared\components\tabs\TabList.svelte generated by Svelte v3.55.0 */

    // (4:0) <TabList class="flex flex-col {$$props.class}">
    function create_default_slot$9(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(4:0) <TabList class=\\\"flex flex-col {$$props.class}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let tablist;
    	let current;

    	tablist = new TabList({
    			props: {
    				class: "flex flex-col " + /*$$props*/ ctx[0].class,
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablist.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tablist_changes = {};
    			if (dirty & /*$$props*/ 1) tablist_changes.class = "flex flex-col " + /*$$props*/ ctx[0].class;

    			if (dirty & /*$$scope*/ 4) {
    				tablist_changes.$$scope = { dirty, ctx };
    			}

    			tablist.$set(tablist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabList', slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ TabList });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, slots, $$scope];
    }

    class TabList_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabList_1",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\shared\components\tabs\Tab.svelte generated by Svelte v3.55.0 */
    const file$9 = "src\\shared\\components\\tabs\\Tab.svelte";

    // (4:0) <Tab let:selected>
    function create_default_slot$8(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();

    			attr_dev(div, "class", div_class_value = "pl-4 py-2 border-l-4 border-b text-left transition-colors duration-200 " + (/*selected*/ ctx[3]
    			? 'font-bold'
    			: 'border-l-transparent') + " " + /*$$props*/ ctx[0].class + "" + " svelte-vttdhl");

    			attr_dev(div, "style", div_style_value = "border-bottom-color: rgba(16, 185, 129, 0.15); " + (/*selected*/ ctx[3]
    			? 'border-left-color: #10b981; color: #10b981;'
    			: 'color: #94a3b8;'));

    			add_location(div, file$9, 4, 1, 102);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*selected, $$props*/ 9 && div_class_value !== (div_class_value = "pl-4 py-2 border-l-4 border-b text-left transition-colors duration-200 " + (/*selected*/ ctx[3]
    			? 'font-bold'
    			: 'border-l-transparent') + " " + /*$$props*/ ctx[0].class + "" + " svelte-vttdhl")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*selected*/ 8 && div_style_value !== (div_style_value = "border-bottom-color: rgba(16, 185, 129, 0.15); " + (/*selected*/ ctx[3]
    			? 'border-left-color: #10b981; color: #10b981;'
    			: 'color: #94a3b8;'))) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(4:0) <Tab let:selected>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let tab;
    	let current;

    	tab = new Tab({
    			props: {
    				$$slots: {
    					default: [
    						create_default_slot$8,
    						({ selected }) => ({ 3: selected }),
    						({ selected }) => selected ? 8 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tab_changes = {};

    			if (dirty & /*$$scope, selected, $$props*/ 13) {
    				tab_changes.$$scope = { dirty, ctx };
    			}

    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Tab });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, slots, $$scope];
    }

    class Tab_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab_1",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\shared\components\tabs\TabPanels.svelte generated by Svelte v3.55.0 */

    // (4:0) <TabPanels class={$$props.class}>
    function create_default_slot$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(4:0) <TabPanels class={$$props.class}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let tabpanels;
    	let current;

    	tabpanels = new TabPanels({
    			props: {
    				class: /*$$props*/ ctx[0].class,
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabpanels.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabpanels, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabpanels_changes = {};
    			if (dirty & /*$$props*/ 1) tabpanels_changes.class = /*$$props*/ ctx[0].class;

    			if (dirty & /*$$scope*/ 4) {
    				tabpanels_changes.$$scope = { dirty, ctx };
    			}

    			tabpanels.$set(tabpanels_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabpanels.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabpanels.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabpanels, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabPanels', slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ TabPanels });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, slots, $$scope];
    }

    class TabPanels_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanels_1",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\shared\components\tabs\TabPanel.svelte generated by Svelte v3.55.0 */

    // (4:0) <TabPanel class={$$props.class}>
    function create_default_slot$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(4:0) <TabPanel class={$$props.class}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let tabpanel;
    	let current;

    	tabpanel = new TabPanel({
    			props: {
    				class: /*$$props*/ ctx[0].class,
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabpanel.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabpanel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabpanel_changes = {};
    			if (dirty & /*$$props*/ 1) tabpanel_changes.class = /*$$props*/ ctx[0].class;

    			if (dirty & /*$$scope*/ 4) {
    				tabpanel_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel.$set(tabpanel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabpanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabpanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabpanel, detaching);
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

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabPanel', slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ TabPanel });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, slots, $$scope];
    }

    class TabPanel_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanel_1",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\manual\components\CodeBlock.svelte generated by Svelte v3.55.0 */

    const file$8 = "src\\manual\\components\\CodeBlock.svelte";

    function create_fragment$9(ctx) {
    	let pre;
    	let t0;
    	let t1;
    	let pre_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			pre = element("pre");
    			t0 = text$1("");
    			if (default_slot) default_slot.c();
    			t1 = text$1("\n");
    			attr_dev(pre, "class", pre_class_value = "bg-slate-300 text-slate-700 px-14 py-5 w-fit h-fit shadow-md rounded-md text-lg " + /*$$props*/ ctx[0].class);
    			add_location(pre, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pre, anchor);
    			append_dev(pre, t0);

    			if (default_slot) {
    				default_slot.m(pre, null);
    			}

    			append_dev(pre, t1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 1 && pre_class_value !== (pre_class_value = "bg-slate-300 text-slate-700 px-14 py-5 w-fit h-fit shadow-md rounded-md text-lg " + /*$$props*/ ctx[0].class)) {
    				attr_dev(pre, "class", pre_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pre);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots('CodeBlock', slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('$$scope' in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, $$scope, slots];
    }

    class CodeBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CodeBlock",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /** All the opcodes */
    const opcodes = [
        {
            symbolic: "NOP",
            numeric: 0,
            takesOperand: false,
            takesImmediate: false,
            operator: "",
            category: "CONTROL_FLOW"
        },
        {
            symbolic: "HLT",
            numeric: 1,
            takesOperand: false,
            takesImmediate: false,
            operator: "",
            category: "CONTROL_FLOW"
        },
        {
            symbolic: "JMP",
            numeric: 2,
            takesOperand: true,
            takesImmediate: false,
            operator: "",
            category: "CONTROL_FLOW"
        },
        {
            symbolic: "JZ",
            numeric: 3,
            takesOperand: true,
            takesImmediate: false,
            operator: "",
            category: "CONTROL_FLOW"
        },
        {
            symbolic: "JNZ",
            numeric: 4,
            takesOperand: true,
            takesImmediate: false,
            operator: "",
            category: "CONTROL_FLOW"
        },
        {
            symbolic: "JN",
            numeric: 5,
            takesOperand: true,
            takesImmediate: false,
            operator: "",
            category: "CONTROL_FLOW"
        },
        {
            symbolic: "JNN",
            numeric: 6,
            takesOperand: true,
            takesImmediate: false,
            operator: "",
            category: "CONTROL_FLOW"
        },
        {
            symbolic: "LOD",
            numeric: 7,
            takesOperand: true,
            takesImmediate: true,
            operator: "=",
            category: "DATA_FLOW"
        },
        {
            symbolic: "STO",
            numeric: 8,
            takesOperand: true,
            takesImmediate: false,
            operator: "",
            category: "DATA_FLOW"
        },
        {
            symbolic: "ADD",
            numeric: 9,
            takesOperand: true,
            takesImmediate: true,
            operator: "+",
            category: "ARITHMETIC_LOGIC"
        },
        {
            symbolic: "SUB",
            numeric: 10,
            takesOperand: true,
            takesImmediate: true,
            operator: "-",
            category: "ARITHMETIC_LOGIC"
        },
        {
            symbolic: "MUL",
            numeric: 11,
            takesOperand: true,
            takesImmediate: true,
            operator: "*",
            category: "ARITHMETIC_LOGIC"
        },
        {
            symbolic: "DIV",
            numeric: 12,
            takesOperand: true,
            takesImmediate: true,
            operator: "/",
            category: "ARITHMETIC_LOGIC"
        },
        {
            symbolic: "AND",
            numeric: 13,
            takesOperand: true,
            takesImmediate: true,
            operator: "&",
            category: "ARITHMETIC_LOGIC"
        },
        {
            symbolic: "CMP",
            numeric: 14,
            takesOperand: true,
            takesImmediate: true,
            operator: ":",
            category: "ARITHMETIC_LOGIC"
        },
        {
            symbolic: "NOT",
            numeric: 15,
            takesOperand: true,
            takesImmediate: true,
            operator: "!",
            category: "ARITHMETIC_LOGIC"
        }
    ];

    /** Position of the bit of the immediate flag in a binary value
     * (in a value of n bits, 1 == most significant bit, n == least significant bit)
     **/
    const IMMEDIATE_FLAG_POS = 1;

    /**
     * Takes either a positive or a negative number and turns it into a valid index from 0 to length-1
     * @param {number} pos - The position that should be converted
     * @param {number} length - The value that the index should be < of
     * @example positionToIndex(-2, 9) === 6
     */
    function positionToIndex(pos, length) {
        if (Math.abs(pos) > length) {
            throw new Error(`Position ${pos} out of range +/-${length}`);
        }
        if (pos === 0) {
            throw new Error("Positions start from 1");
        }
        return pos < 0 ? this.value.length + pos : pos - 1;
    }

    const MAX_BITS = 32; // js limit for bitwise operations
    const MIN_BITS = 1;
    function checkValidBitCount(bits) {
        if (bits < MIN_BITS || bits > MAX_BITS) {
            throw new Error(`Binary numbers must be between ${MIN_BITS} and ${MAX_BITS} bits`);
        }
    }
    function numberToBinaryString(value, bits) {
        checkValidBitCount(bits);
        return pad((value >>> 0).toString(2), bits);
    }
    function pad(bin, bits) {
        return ("00000000000000000000000000000000" + bin).slice(-bits);
    }
    // pos can be either negative or positive, a negative pos start from the lsb
    // pos goes from 1 to binString.length or from -1 to -binString.length
    function setBit(binString, pos, value) {
        if (!/^[10]*$/.test(binString)) {
            throw new Error("Invalid binary string");
        }
        let bits = binString.split("");
        bits[positionToIndex(pos, binString.length)] = value ? "1" : "0";
        return bits.join("");
    }

    /* src\manual\components\OpcodesTable.svelte generated by Svelte v3.55.0 */
    const file$7 = "src\\manual\\components\\OpcodesTable.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (37:1) {#each opcodes.filter(opcode => opcode.category === "CONTROL_FLOW") as opcode}
    function create_each_block_2$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*direct*/ ctx[1](/*opcode*/ ctx[5]) + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*immediate*/ ctx[2](/*opcode*/ ctx[5]) + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*$text*/ ctx[0].opcodes_table.descriptions[/*opcode*/ ctx[5].symbolic] + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text$1(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text$1(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text$1(t4_value);
    			attr_dev(td0, "class", "svelte-18m2d13");
    			add_location(td0, file$7, 38, 3, 1354);
    			attr_dev(td1, "class", "svelte-18m2d13");
    			add_location(td1, file$7, 39, 3, 1383);
    			attr_dev(td2, "class", "text-left svelte-18m2d13");
    			add_location(td2, file$7, 40, 3, 1415);
    			attr_dev(tr, "class", "bg-green-200 svelte-18m2d13");
    			add_location(tr, file$7, 37, 2, 1325);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t4_value !== (t4_value = /*$text*/ ctx[0].opcodes_table.descriptions[/*opcode*/ ctx[5].symbolic] + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(37:1) {#each opcodes.filter(opcode => opcode.category === \\\"CONTROL_FLOW\\\") as opcode}",
    		ctx
    	});

    	return block;
    }

    // (49:1) {#each opcodes.filter(opcode => opcode.category === "DATA_FLOW") as opcode}
    function create_each_block_1$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*direct*/ ctx[1](/*opcode*/ ctx[5]) + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*immediate*/ ctx[2](/*opcode*/ ctx[5]) + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*$text*/ ctx[0].opcodes_table.descriptions[/*opcode*/ ctx[5].symbolic] + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text$1(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text$1(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text$1(t4_value);
    			attr_dev(td0, "class", "svelte-18m2d13");
    			add_location(td0, file$7, 50, 3, 1727);
    			attr_dev(td1, "class", "svelte-18m2d13");
    			add_location(td1, file$7, 51, 3, 1756);
    			attr_dev(td2, "class", "text-left svelte-18m2d13");
    			add_location(td2, file$7, 52, 3, 1788);
    			attr_dev(tr, "class", "bg-red-200 svelte-18m2d13");
    			add_location(tr, file$7, 49, 2, 1700);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t4_value !== (t4_value = /*$text*/ ctx[0].opcodes_table.descriptions[/*opcode*/ ctx[5].symbolic] + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(49:1) {#each opcodes.filter(opcode => opcode.category === \\\"DATA_FLOW\\\") as opcode}",
    		ctx
    	});

    	return block;
    }

    // (61:1) {#each opcodes.filter(opcode => opcode.category === "ARITHMETIC_LOGIC") as opcode}
    function create_each_block$3(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*direct*/ ctx[1](/*opcode*/ ctx[5]) + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*immediate*/ ctx[2](/*opcode*/ ctx[5]) + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*$text*/ ctx[0].opcodes_table.descriptions[/*opcode*/ ctx[5].symbolic] + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text$1(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text$1(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text$1(t4_value);
    			t5 = space();
    			attr_dev(td0, "class", "svelte-18m2d13");
    			add_location(td0, file$7, 62, 3, 2120);
    			attr_dev(td1, "class", "svelte-18m2d13");
    			add_location(td1, file$7, 63, 3, 2149);
    			attr_dev(td2, "class", "text-left svelte-18m2d13");
    			add_location(td2, file$7, 64, 3, 2181);
    			attr_dev(tr, "class", "bg-purple-200 svelte-18m2d13");
    			add_location(tr, file$7, 61, 2, 2090);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t4_value !== (t4_value = /*$text*/ ctx[0].opcodes_table.descriptions[/*opcode*/ ctx[5].symbolic] + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(61:1) {#each opcodes.filter(opcode => opcode.category === \\\"ARITHMETIC_LOGIC\\\") as opcode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let table;
    	let tr0;
    	let th0;
    	let t0_value = /*$text*/ ctx[0].opcodes_table.sections_titles.control_flow + "";
    	let t0;
    	let t1;
    	let colgroup;
    	let col0;
    	let t2;
    	let col1;
    	let t3;
    	let col2;
    	let t4;
    	let t5;
    	let tr1;
    	let th1;
    	let t6_value = /*$text*/ ctx[0].opcodes_table.sections_titles.data_flow + "";
    	let t6;
    	let t7;
    	let t8;
    	let tr2;
    	let th2;
    	let t9_value = /*$text*/ ctx[0].opcodes_table.sections_titles.arithmetic_logic + "";
    	let t9;
    	let t10;
    	let table_class_value;
    	let each_value_2 = opcodes.filter(func);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = opcodes.filter(func_1);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = opcodes.filter(func_2);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			t0 = text$1(t0_value);
    			t1 = space();
    			colgroup = element("colgroup");
    			col0 = element("col");
    			t2 = space();
    			col1 = element("col");
    			t3 = space();
    			col2 = element("col");
    			t4 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t5 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			t6 = text$1(t6_value);
    			t7 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t8 = space();
    			tr2 = element("tr");
    			th2 = element("th");
    			t9 = text$1(t9_value);
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "colspan", "3");
    			attr_dev(th0, "class", "svelte-18m2d13");
    			add_location(th0, file$7, 26, 2, 943);
    			attr_dev(tr0, "class", "bg-green-300 svelte-18m2d13");
    			add_location(tr0, file$7, 25, 1, 915);
    			attr_dev(col0, "class", "w-32 rounded-t");
    			add_location(col0, file$7, 32, 2, 1138);
    			attr_dev(col1, "class", "w-32");
    			add_location(col1, file$7, 33, 2, 1171);
    			attr_dev(col2, "class", "w-[40rem] text-left");
    			add_location(col2, file$7, 34, 2, 1194);
    			add_location(colgroup, file$7, 31, 1, 1125);
    			attr_dev(th1, "colspan", "3");
    			attr_dev(th1, "class", "svelte-18m2d13");
    			add_location(th1, file$7, 44, 2, 1538);
    			attr_dev(tr1, "class", "bg-red-300 svelte-18m2d13");
    			add_location(tr1, file$7, 43, 1, 1512);
    			attr_dev(th2, "colspan", "3");
    			attr_dev(th2, "class", "svelte-18m2d13");
    			add_location(th2, file$7, 56, 2, 1914);
    			attr_dev(tr2, "class", "bg-purple-300 svelte-18m2d13");
    			add_location(tr2, file$7, 55, 1, 1885);
    			attr_dev(table, "class", table_class_value = "text-center border-collapse shadow-lg " + /*$$props*/ ctx[3].class);
    			add_location(table, file$7, 24, 0, 844);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(th0, t0);
    			append_dev(table, t1);
    			append_dev(table, colgroup);
    			append_dev(colgroup, col0);
    			append_dev(colgroup, t2);
    			append_dev(colgroup, col1);
    			append_dev(colgroup, t3);
    			append_dev(colgroup, col2);
    			append_dev(table, t4);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(table, null);
    			}

    			append_dev(table, t5);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(th1, t6);
    			append_dev(table, t7);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(table, null);
    			}

    			append_dev(table, t8);
    			append_dev(table, tr2);
    			append_dev(tr2, th2);
    			append_dev(th2, t9);
    			append_dev(table, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$text*/ 1 && t0_value !== (t0_value = /*$text*/ ctx[0].opcodes_table.sections_titles.control_flow + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$text, opcodes, immediate, direct*/ 7) {
    				each_value_2 = opcodes.filter(func);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(table, t5);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*$text*/ 1 && t6_value !== (t6_value = /*$text*/ ctx[0].opcodes_table.sections_titles.data_flow + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*$text, opcodes, immediate, direct*/ 7) {
    				each_value_1 = opcodes.filter(func_1);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(table, t8);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$text*/ 1 && t9_value !== (t9_value = /*$text*/ ctx[0].opcodes_table.sections_titles.arithmetic_logic + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*$text, opcodes, immediate, direct*/ 7) {
    				each_value = opcodes.filter(func_2);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$$props*/ 8 && table_class_value !== (table_class_value = "text-center border-collapse shadow-lg " + /*$$props*/ ctx[3].class)) {
    				attr_dev(table, "class", table_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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

    const func = opcode => opcode.category === "CONTROL_FLOW";
    const func_1 = opcode => opcode.category === "DATA_FLOW";
    const func_2 = opcode => opcode.category === "ARITHMETIC_LOGIC";

    function instance$8($$self, $$props, $$invalidate) {
    	let $text;
    	validate_store(text, 'text');
    	component_subscribe($$self, text, $$value => $$invalidate(0, $text = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OpcodesTable', slots, []);

    	function direct(opcode) {
    		let symbolic = opcode.symbolic;

    		if (opcode.takesOperand) {
    			symbolic += " X";
    		}

    		let binary = numberToBinaryString(opcode.numeric, 8);
    		return `${symbolic} ${binary}`;
    	}

    	function immediate(opcode) {
    		if (!opcode.takesImmediate) {
    			return "";
    		}

    		let symbolic = `${opcode.symbolic} #X`;
    		return `${symbolic} ${binaryOpcodeWithImmediateFlagSet(opcode.numeric)}`;
    	}

    	function binaryOpcodeWithImmediateFlagSet(opcode) {
    		return setBit(numberToBinaryString(opcode, 8), IMMEDIATE_FLAG_POS, true);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({
    		opcodes,
    		IMMEDIATE_FLAG_POS,
    		numberToBinaryString,
    		setBit,
    		text,
    		direct,
    		immediate,
    		binaryOpcodeWithImmediateFlagSet,
    		$text
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$text, direct, immediate, $$props];
    }

    class OpcodesTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OpcodesTable",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\manual\components\Section.svelte generated by Svelte v3.55.0 */

    const file$6 = "src\\manual\\components\\Section.svelte";

    // (11:18) 
    function create_if_block_3(ctx) {
    	let h4;
    	let t;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			t = text$1(/*title*/ ctx[0]);
    			attr_dev(h4, "class", "font-bold text-md mb-2");
    			add_location(h4, file$6, 11, 1, 294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(11:18) ",
    		ctx
    	});

    	return block;
    }

    // (9:18) 
    function create_if_block_2(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text$1(/*title*/ ctx[0]);
    			attr_dev(h3, "class", "font-bold text-2xl mb-3");
    			add_location(h3, file$6, 9, 1, 225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(9:18) ",
    		ctx
    	});

    	return block;
    }

    // (7:18) 
    function create_if_block_1(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text$1(/*title*/ ctx[0]);
    			attr_dev(h2, "class", "font-bold text-3xl mb-5");
    			add_location(h2, file$6, 7, 1, 156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(7:18) ",
    		ctx
    	});

    	return block;
    }

    // (5:0) {#if h === 1}
    function create_if_block(ctx) {
    	let h1;
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text$1(/*title*/ ctx[0]);
    			attr_dev(h1, "class", "font-bold text-4xl mb-5");
    			add_location(h1, file$6, 5, 1, 87);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(5:0) {#if h === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t;
    	let div;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*h*/ ctx[1] === 1) return create_if_block;
    		if (/*h*/ ctx[1] === 2) return create_if_block_1;
    		if (/*h*/ ctx[1] === 3) return create_if_block_2;
    		if (/*h*/ ctx[1] === 4) return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "px-6 mb-8");
    			add_location(div, file$6, 13, 0, 348);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots('Section', slots, ['default']);
    	let { title = "" } = $$props;
    	let { h = 2 } = $$props;
    	const writable_props = ['title', 'h'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('h' in $$props) $$invalidate(1, h = $$props.h);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, h });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('h' in $$props) $$invalidate(1, h = $$props.h);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, h, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$7, create_fragment$7, safe_not_equal, { title: 0, h: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get title() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get h() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set h(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\manual\components\sections\InstructionSet.svelte generated by Svelte v3.55.0 */
    const file$5 = "src\\manual\\components\\sections\\InstructionSet.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (7:0) <Section title={$text.sections.instruction_set.subsections.instruction_set.title} h={2}>
    function create_default_slot_6$2(ctx) {
    	let opcodestable;
    	let current;

    	opcodestable = new OpcodesTable({
    			props: { class: "mx-auto" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(opcodestable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(opcodestable, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(opcodestable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(opcodestable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(opcodestable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$2.name,
    		type: "slot",
    		source: "(7:0) <Section title={$text.sections.instruction_set.subsections.instruction_set.title} h={2}>",
    		ctx
    	});

    	return block;
    }

    // (11:0) <Section title={$text.sections.instruction_set.subsections.instruction_structure.title} h={2}>
    function create_default_slot_5$2(ctx) {
    	let div24;
    	let div11;
    	let div9;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div5;
    	let div3;
    	let t5;
    	let div4;
    	let t7;
    	let div8;
    	let div6;
    	let t9;
    	let div7;
    	let t11;
    	let div10;
    	let p0;
    	let span0;
    	let t13;
    	let t14_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.opcode_desc + "";
    	let t14;
    	let t15;
    	let p1;
    	let span1;
    	let t17;
    	let t18_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.immediate_flag_desc + "";
    	let t18;
    	let t19;
    	let p2;
    	let span2;
    	let t21;
    	let t22_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.operand_desc + "";
    	let t22;
    	let t23;
    	let div23;
    	let div21;
    	let div14;
    	let div12;
    	let t25;
    	let div13;
    	let t27;
    	let div17;
    	let div15;
    	let t29;
    	let div16;
    	let t31;
    	let div20;
    	let div18;
    	let t33;
    	let div19;
    	let t35;
    	let div22;
    	let p3;
    	let span3;
    	let t37;
    	let t38_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.immediate_flag_desc + "";
    	let t38;
    	let t39;
    	let p4;
    	let span4;
    	let t41;
    	let t42_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.opcode_desc + "";
    	let t42;
    	let t43;
    	let p5;
    	let span5;
    	let t45;
    	let t46_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.operand_desc + "";
    	let t46;

    	const block = {
    		c: function create() {
    			div24 = element("div");
    			div11 = element("div");
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "ADD";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "A";
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "#";
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "B";
    			t7 = space();
    			div8 = element("div");
    			div6 = element("div");
    			div6.textContent = "22";
    			t9 = space();
    			div7 = element("div");
    			div7.textContent = "C";
    			t11 = space();
    			div10 = element("div");
    			p0 = element("p");
    			span0 = element("span");
    			span0.textContent = "A";
    			t13 = text$1("\n\t\t\t\t\tOpcode - ");
    			t14 = text$1(t14_value);
    			t15 = space();
    			p1 = element("p");
    			span1 = element("span");
    			span1.textContent = "B";
    			t17 = text$1("\n\t\t\t\t\tImmediate Flag - ");
    			t18 = text$1(t18_value);
    			t19 = space();
    			p2 = element("p");
    			span2 = element("span");
    			span2.textContent = "C";
    			t21 = text$1("\n\t\t\t\t\tOperand - ");
    			t22 = text$1(t22_value);
    			t23 = space();
    			div23 = element("div");
    			div21 = element("div");
    			div14 = element("div");
    			div12 = element("div");
    			div12.textContent = "0";
    			t25 = space();
    			div13 = element("div");
    			div13.textContent = "A";
    			t27 = space();
    			div17 = element("div");
    			div15 = element("div");
    			div15.textContent = "0000000";
    			t29 = space();
    			div16 = element("div");
    			div16.textContent = "B";
    			t31 = space();
    			div20 = element("div");
    			div18 = element("div");
    			div18.textContent = "00000000";
    			t33 = space();
    			div19 = element("div");
    			div19.textContent = "C";
    			t35 = space();
    			div22 = element("div");
    			p3 = element("p");
    			span3 = element("span");
    			span3.textContent = "A";
    			t37 = text$1("\n\t\t\t\t\tImmediate Flag - ");
    			t38 = text$1(t38_value);
    			t39 = space();
    			p4 = element("p");
    			span4 = element("span");
    			span4.textContent = "B";
    			t41 = text$1("\n\t\t\t\t\tOpcode - ");
    			t42 = text$1(t42_value);
    			t43 = space();
    			p5 = element("p");
    			span5 = element("span");
    			span5.textContent = "C";
    			t45 = text$1("\n\t\t\t\t\tOperand - ");
    			t46 = text$1(t46_value);
    			add_location(div0, file$5, 15, 5, 692);
    			attr_dev(div1, "class", "text-2xl");
    			add_location(div1, file$5, 16, 5, 712);
    			attr_dev(div2, "class", "flex flex-col items-center text-green-700");
    			add_location(div2, file$5, 14, 4, 631);
    			add_location(div3, file$5, 19, 5, 822);
    			attr_dev(div4, "class", "text-2xl");
    			add_location(div4, file$5, 20, 5, 840);
    			attr_dev(div5, "class", "flex flex-col items-center ml-2 text-cyan-300");
    			add_location(div5, file$5, 18, 4, 757);
    			add_location(div6, file$5, 23, 5, 944);
    			attr_dev(div7, "class", "text-2xl");
    			add_location(div7, file$5, 24, 5, 963);
    			attr_dev(div8, "class", "flex flex-col items-center text-red-500");
    			add_location(div8, file$5, 22, 4, 885);
    			attr_dev(div9, "class", "w-fit px-7 py-4 mx-auto text-3xl flex items-center justify-center rounded-lg bg-gray-500");
    			add_location(div9, file$5, 13, 3, 524);
    			attr_dev(span0, "class", "bg-gray-500 text-green-700 py-2 px-3 text-xl box-border inline-block w-fit shadow-md rounded-md");
    			add_location(span0, file$5, 29, 5, 1119);
    			attr_dev(p0, "class", "");
    			add_location(p0, file$5, 28, 4, 1101);
    			attr_dev(span1, "class", "bg-gray-500 text-cyan-300 py-2 px-3 text-xl box-border inline-block w-fit shadow-md rounded-md");
    			add_location(span1, file$5, 36, 5, 1381);
    			attr_dev(p1, "class", "");
    			add_location(p1, file$5, 35, 4, 1363);
    			attr_dev(span2, "class", "bg-gray-500 text-red-500 py-2 px-3 text-xl box-border inline-block w-fit shadow-md rounded-md");
    			add_location(span2, file$5, 44, 5, 1665);
    			attr_dev(p2, "class", "");
    			add_location(p2, file$5, 43, 4, 1647);
    			attr_dev(div10, "class", "mx-auto mt-7 flex flex-col items-start justify-center gap-1 w-fit");
    			add_location(div10, file$5, 27, 3, 1017);
    			attr_dev(div11, "class", "p-1 mb-7");
    			add_location(div11, file$5, 12, 2, 498);
    			add_location(div12, file$5, 55, 5, 2114);
    			attr_dev(div13, "class", "text-2xl");
    			add_location(div13, file$5, 56, 5, 2132);
    			attr_dev(div14, "class", "flex flex-col items-center text-cyan-300");
    			add_location(div14, file$5, 54, 4, 2054);
    			add_location(div15, file$5, 59, 5, 2238);
    			attr_dev(div16, "class", "text-2xl");
    			add_location(div16, file$5, 60, 5, 2262);
    			attr_dev(div17, "class", "flex flex-col items-center text-green-700");
    			add_location(div17, file$5, 58, 4, 2177);
    			add_location(div18, file$5, 63, 5, 2371);
    			attr_dev(div19, "class", "text-2xl");
    			add_location(div19, file$5, 64, 5, 2396);
    			attr_dev(div20, "class", "flex flex-col items-center ml-2 text-red-500");
    			add_location(div20, file$5, 62, 4, 2307);
    			attr_dev(div21, "class", "w-fit px-7 py-4 mx-auto text-3xl flex items-center justify-center rounded-lg bg-gray-500");
    			add_location(div21, file$5, 53, 3, 1947);
    			attr_dev(span3, "class", "bg-gray-500 text-cyan-300 py-2 px-3 text-xl box-border inline-block w-fit shadow-md rounded-md");
    			add_location(span3, file$5, 69, 5, 2552);
    			attr_dev(p3, "class", "");
    			add_location(p3, file$5, 68, 4, 2534);
    			attr_dev(span4, "class", "bg-gray-500 text-green-700 py-2 px-3 text-xl box-border inline-block w-fit shadow-md rounded-md");
    			add_location(span4, file$5, 77, 5, 2836);
    			attr_dev(p4, "class", "");
    			add_location(p4, file$5, 76, 4, 2818);
    			attr_dev(span5, "class", "bg-gray-500 text-red-500 py-2 px-3 text-xl box-border inline-block w-fit shadow-md rounded-md");
    			add_location(span5, file$5, 84, 5, 3098);
    			attr_dev(p5, "class", "");
    			add_location(p5, file$5, 83, 4, 3080);
    			attr_dev(div22, "class", "mx-auto mt-7 flex flex-col items-start justify-center gap-1 w-fit");
    			add_location(div22, file$5, 67, 3, 2450);
    			attr_dev(div23, "class", "p-1");
    			add_location(div23, file$5, 52, 2, 1926);
    			attr_dev(div24, "class", "flex flex-wrap itmes-center justify-evenly");
    			add_location(div24, file$5, 11, 1, 439);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div24, anchor);
    			append_dev(div24, div11);
    			append_dev(div11, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div9, t3);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div11, t11);
    			append_dev(div11, div10);
    			append_dev(div10, p0);
    			append_dev(p0, span0);
    			append_dev(p0, t13);
    			append_dev(p0, t14);
    			append_dev(div10, t15);
    			append_dev(div10, p1);
    			append_dev(p1, span1);
    			append_dev(p1, t17);
    			append_dev(p1, t18);
    			append_dev(div10, t19);
    			append_dev(div10, p2);
    			append_dev(p2, span2);
    			append_dev(p2, t21);
    			append_dev(p2, t22);
    			append_dev(div24, t23);
    			append_dev(div24, div23);
    			append_dev(div23, div21);
    			append_dev(div21, div14);
    			append_dev(div14, div12);
    			append_dev(div14, t25);
    			append_dev(div14, div13);
    			append_dev(div21, t27);
    			append_dev(div21, div17);
    			append_dev(div17, div15);
    			append_dev(div17, t29);
    			append_dev(div17, div16);
    			append_dev(div21, t31);
    			append_dev(div21, div20);
    			append_dev(div20, div18);
    			append_dev(div20, t33);
    			append_dev(div20, div19);
    			append_dev(div23, t35);
    			append_dev(div23, div22);
    			append_dev(div22, p3);
    			append_dev(p3, span3);
    			append_dev(p3, t37);
    			append_dev(p3, t38);
    			append_dev(div22, t39);
    			append_dev(div22, p4);
    			append_dev(p4, span4);
    			append_dev(p4, t41);
    			append_dev(p4, t42);
    			append_dev(div22, t43);
    			append_dev(div22, p5);
    			append_dev(p5, span5);
    			append_dev(p5, t45);
    			append_dev(p5, t46);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t14_value !== (t14_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.opcode_desc + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*$text*/ 1 && t18_value !== (t18_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.immediate_flag_desc + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*$text*/ 1 && t22_value !== (t22_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.operand_desc + "")) set_data_dev(t22, t22_value);
    			if (dirty & /*$text*/ 1 && t38_value !== (t38_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.immediate_flag_desc + "")) set_data_dev(t38, t38_value);
    			if (dirty & /*$text*/ 1 && t42_value !== (t42_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.opcode_desc + "")) set_data_dev(t42, t42_value);
    			if (dirty & /*$text*/ 1 && t46_value !== (t46_value = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.operand_desc + "")) set_data_dev(t46, t46_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div24);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(11:0) <Section title={$text.sections.instruction_set.subsections.instruction_structure.title} h={2}>",
    		ctx
    	});

    	return block;
    }

    // (101:2) {#each $text.sections.instruction_set.subsections.addressing_modes.subsections.immediate.paragraphs as paragraph}
    function create_each_block_1$1(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text$1(t_value);
    			add_location(p, file$5, 101, 3, 3705);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*paragraph*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(101:2) {#each $text.sections.instruction_set.subsections.addressing_modes.subsections.immediate.paragraphs as paragraph}",
    		ctx
    	});

    	return block;
    }

    // (105:2) <CodeBlock class="text-base mt-3 px-6">
    function create_default_slot_4$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1("LOD #120\nMUL #-1\nLOD #LABEL");
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
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(105:2) <CodeBlock class=\\\"text-base mt-3 px-6\\\">",
    		ctx
    	});

    	return block;
    }

    // (97:1) <Section   title={$text.sections.instruction_set.subsections.addressing_modes.subsections.immediate.title}   h={3}  >
    function create_default_slot_3$2(ctx) {
    	let t;
    	let codeblock;
    	let current;
    	let each_value_1 = /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.subsections.immediate.paragraphs;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	codeblock = new CodeBlock({
    			props: {
    				class: "text-base mt-3 px-6",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			create_component(codeblock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(codeblock, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1) {
    				each_value_1 = /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.subsections.immediate.paragraphs;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			const codeblock_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				codeblock_changes.$$scope = { dirty, ctx };
    			}

    			codeblock.$set(codeblock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(codeblock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(codeblock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(codeblock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(97:1) <Section   title={$text.sections.instruction_set.subsections.addressing_modes.subsections.immediate.title}   h={3}  >",
    		ctx
    	});

    	return block;
    }

    // (112:2) {#each $text.sections.instruction_set.subsections.addressing_modes.subsections.direct.paragraphs as paragraph}
    function create_each_block$2(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text$1(t_value);
    			add_location(p, file$5, 112, 3, 4084);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*paragraph*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(112:2) {#each $text.sections.instruction_set.subsections.addressing_modes.subsections.direct.paragraphs as paragraph}",
    		ctx
    	});

    	return block;
    }

    // (116:2) <CodeBlock class="text-base mt-3 px-6">
    function create_default_slot_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1("MUL 22\nDIV LABEL");
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
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(116:2) <CodeBlock class=\\\"text-base mt-3 px-6\\\">",
    		ctx
    	});

    	return block;
    }

    // (111:1) <Section title={$text.sections.instruction_set.subsections.addressing_modes.subsections.direct.title} h={3}>
    function create_default_slot_1$3(ctx) {
    	let t;
    	let codeblock;
    	let current;
    	let each_value = /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.subsections.direct.paragraphs;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	codeblock = new CodeBlock({
    			props: {
    				class: "text-base mt-3 px-6",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			create_component(codeblock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(codeblock, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1) {
    				each_value = /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.subsections.direct.paragraphs;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const codeblock_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				codeblock_changes.$$scope = { dirty, ctx };
    			}

    			codeblock.$set(codeblock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(codeblock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(codeblock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(codeblock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(111:1) <Section title={$text.sections.instruction_set.subsections.addressing_modes.subsections.direct.title} h={3}>",
    		ctx
    	});

    	return block;
    }

    // (96:0) <Section title={$text.sections.instruction_set.subsections.addressing_modes.title} h={2}>
    function create_default_slot$5(ctx) {
    	let section0;
    	let t;
    	let section1;
    	let current;

    	section0 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.subsections.immediate.title,
    				h: 3,
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.subsections.direct.title,
    				h: 3,
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section0.$$.fragment);
    			t = space();
    			create_component(section1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(section0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(section1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const section0_changes = {};
    			if (dirty & /*$text*/ 1) section0_changes.title = /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.subsections.immediate.title;

    			if (dirty & /*$$scope, $text*/ 65) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};
    			if (dirty & /*$text*/ 1) section1_changes.title = /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.subsections.direct.title;

    			if (dirty & /*$$scope, $text*/ 65) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(section1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(96:0) <Section title={$text.sections.instruction_set.subsections.addressing_modes.title} h={2}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section0;
    	let t0;
    	let section1;
    	let t1;
    	let section2;
    	let current;

    	section0 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_set.title,
    				h: 2,
    				$$slots: { default: [create_default_slot_6$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.title,
    				h: 2,
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section2 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.title,
    				h: 2,
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section0.$$.fragment);
    			t0 = space();
    			create_component(section1.$$.fragment);
    			t1 = space();
    			create_component(section2.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(section1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(section2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section0_changes = {};
    			if (dirty & /*$text*/ 1) section0_changes.title = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_set.title;

    			if (dirty & /*$$scope*/ 64) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};
    			if (dirty & /*$text*/ 1) section1_changes.title = /*$text*/ ctx[0].sections.instruction_set.subsections.instruction_structure.title;

    			if (dirty & /*$$scope, $text*/ 65) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};
    			if (dirty & /*$text*/ 1) section2_changes.title = /*$text*/ ctx[0].sections.instruction_set.subsections.addressing_modes.title;

    			if (dirty & /*$$scope, $text*/ 65) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(section1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(section2, detaching);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let $text;
    	validate_store(text, 'text');
    	component_subscribe($$self, text, $$value => $$invalidate(0, $text = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InstructionSet', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<InstructionSet> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		text,
    		CodeBlock,
    		OpcodesTable,
    		Section,
    		$text
    	});

    	return [$text];
    }

    class InstructionSet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InstructionSet",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\manual\components\sections\Introduction.svelte generated by Svelte v3.55.0 */
    const file$4 = "src\\manual\\components\\sections\\Introduction.svelte";

    // (5:0) <Section title={$text.sections.introduction.subsections.introduction.title}>
    function create_default_slot$4(ctx) {
    	let p;
    	let t_value = /*$text*/ ctx[0].sections.introduction.subsections.introduction.text + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text$1(t_value);
    			add_location(p, file$4, 5, 1, 188);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*$text*/ ctx[0].sections.introduction.subsections.introduction.text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(5:0) <Section title={$text.sections.introduction.subsections.introduction.title}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.introduction.subsections.introduction.title,
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};
    			if (dirty & /*$text*/ 1) section_changes.title = /*$text*/ ctx[0].sections.introduction.subsections.introduction.title;

    			if (dirty & /*$$scope, $text*/ 3) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
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
    	let $text;
    	validate_store(text, 'text');
    	component_subscribe($$self, text, $$value => $$invalidate(0, $text = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Introduction', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Introduction> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ text, Section, $text });
    	return [$text];
    }

    class Introduction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Introduction",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\manual\components\sections\Examples.svelte generated by Svelte v3.55.0 */
    const file$3 = "src\\manual\\components\\sections\\Examples.svelte";

    // (9:2) <CodeBlock>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1("IF (condition)\nTHEN\n\tinstruction_1\nELSE\n\tinstruction_2\nENDIF\ninstruction_3");
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
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(9:2) <CodeBlock>",
    		ctx
    	});

    	return block;
    }

    // (19:2) <CodeBlock>
    function create_default_slot_6$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1("IF (X == 3)\nTHEN\n\tY = Y + 5\nELSE\n\tZ = Z + 2\nENDIF\nX = 8");
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
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(19:2) <CodeBlock>",
    		ctx
    	});

    	return block;
    }

    // (29:2) <CodeBlock>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1("‌               LOD X\n               CMP #3\n               JNZ ELSE\nTHEN:          LOD #5\n               ADD Y\n               STO Y\n               JMP ENDIF\nELSE:          LOD #2\n               ADD Z\n               STO Z\nENDIF:         LOD #8\n               STO X\n               HLT\nX:             3\nY:             0\nZ:             0");
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
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(29:2) <CodeBlock>",
    		ctx
    	});

    	return block;
    }

    // (6:0) <Section title={$text.sections.examples.subsections.if_then_else.title}>
    function create_default_slot_4$1(ctx) {
    	let div;
    	let codeblock0;
    	let t0;
    	let codeblock1;
    	let t1;
    	let codeblock2;
    	let current;

    	codeblock0 = new CodeBlock({
    			props: {
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	codeblock1 = new CodeBlock({
    			props: {
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	codeblock2 = new CodeBlock({
    			props: {
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(codeblock0.$$.fragment);
    			t0 = space();
    			create_component(codeblock1.$$.fragment);
    			t1 = space();
    			create_component(codeblock2.$$.fragment);
    			attr_dev(div, "class", "w-full flex flex-wrap justify-center gap-10");
    			add_location(div, file$3, 6, 1, 230);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(codeblock0, div, null);
    			append_dev(div, t0);
    			mount_component(codeblock1, div, null);
    			append_dev(div, t1);
    			mount_component(codeblock2, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const codeblock0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				codeblock0_changes.$$scope = { dirty, ctx };
    			}

    			codeblock0.$set(codeblock0_changes);
    			const codeblock1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				codeblock1_changes.$$scope = { dirty, ctx };
    			}

    			codeblock1.$set(codeblock1_changes);
    			const codeblock2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				codeblock2_changes.$$scope = { dirty, ctx };
    			}

    			codeblock2.$set(codeblock2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(codeblock0.$$.fragment, local);
    			transition_in(codeblock1.$$.fragment, local);
    			transition_in(codeblock2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(codeblock0.$$.fragment, local);
    			transition_out(codeblock1.$$.fragment, local);
    			transition_out(codeblock2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(codeblock0);
    			destroy_component(codeblock1);
    			destroy_component(codeblock2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(6:0) <Section title={$text.sections.examples.subsections.if_then_else.title}>",
    		ctx
    	});

    	return block;
    }

    // (53:2) <CodeBlock>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1("instruction_1\nWHILE (condition)\nDO\n\tinstruction_2\n\tinstruction_3\nENDWHILE");
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
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(53:2) <CodeBlock>",
    		ctx
    	});

    	return block;
    }

    // (62:2) <CodeBlock>
    function create_default_slot_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1("SUM = 0\nCOUNT = 0\nWHILE COUNT != MAX\nDO\n\tCOUNT = COUNT + 1\n\tSUM = SUM + COUNT\nENDWHILE");
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
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(62:2) <CodeBlock>",
    		ctx
    	});

    	return block;
    }

    // (72:2) <CodeBlock>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1("‌               LOD #0\n               STO SUM\n               STO COUNT\nWHILE:         LOD COUNT\n               CMP MAX\n               JZ ENDWHILE\n               ADD #1\n               STO COUNT\n               ADD SUM\n               STO SUM\n               JMP WHILE\nENDWHILE:      HLT\nMAX:           5\nCOUNT:         0\nSUM:           0");
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
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(72:2) <CodeBlock>",
    		ctx
    	});

    	return block;
    }

    // (50:0) <Section title={$text.sections.examples.subsections.do_while.title}>
    function create_default_slot$3(ctx) {
    	let div;
    	let codeblock0;
    	let t0;
    	let codeblock1;
    	let t1;
    	let codeblock2;
    	let current;

    	codeblock0 = new CodeBlock({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	codeblock1 = new CodeBlock({
    			props: {
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	codeblock2 = new CodeBlock({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(codeblock0.$$.fragment);
    			t0 = space();
    			create_component(codeblock1.$$.fragment);
    			t1 = space();
    			create_component(codeblock2.$$.fragment);
    			attr_dev(div, "class", "w-full flex flex-wrap justify-center gap-10");
    			add_location(div, file$3, 50, 1, 1124);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(codeblock0, div, null);
    			append_dev(div, t0);
    			mount_component(codeblock1, div, null);
    			append_dev(div, t1);
    			mount_component(codeblock2, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const codeblock0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				codeblock0_changes.$$scope = { dirty, ctx };
    			}

    			codeblock0.$set(codeblock0_changes);
    			const codeblock1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				codeblock1_changes.$$scope = { dirty, ctx };
    			}

    			codeblock1.$set(codeblock1_changes);
    			const codeblock2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				codeblock2_changes.$$scope = { dirty, ctx };
    			}

    			codeblock2.$set(codeblock2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(codeblock0.$$.fragment, local);
    			transition_in(codeblock1.$$.fragment, local);
    			transition_in(codeblock2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(codeblock0.$$.fragment, local);
    			transition_out(codeblock1.$$.fragment, local);
    			transition_out(codeblock2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(codeblock0);
    			destroy_component(codeblock1);
    			destroy_component(codeblock2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(50:0) <Section title={$text.sections.examples.subsections.do_while.title}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section0;
    	let t;
    	let section1;
    	let current;

    	section0 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.examples.subsections.if_then_else.title,
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.examples.subsections.do_while.title,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section0.$$.fragment);
    			t = space();
    			create_component(section1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(section1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section0_changes = {};
    			if (dirty & /*$text*/ 1) section0_changes.title = /*$text*/ ctx[0].sections.examples.subsections.if_then_else.title;

    			if (dirty & /*$$scope*/ 2) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};
    			if (dirty & /*$text*/ 1) section1_changes.title = /*$text*/ ctx[0].sections.examples.subsections.do_while.title;

    			if (dirty & /*$$scope*/ 2) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(section1, detaching);
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
    	let $text;
    	validate_store(text, 'text');
    	component_subscribe($$self, text, $$value => $$invalidate(0, $text = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Examples', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Examples> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ text, CodeBlock, Section, $text });
    	return [$text];
    }

    class Examples extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Examples",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\manual\components\sections\KeyboardShortcuts.svelte generated by Svelte v3.55.0 */
    const file$2 = "src\\manual\\components\\sections\\KeyboardShortcuts.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (29:2) {#each $text.shortcuts_table.ram_editing.shortcuts as shortcut}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*shortcut*/ ctx[2].keys + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*shortcut*/ ctx[2].condition + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*shortcut*/ ctx[2].description + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text$1(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text$1(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text$1(t4_value);
    			t5 = space();
    			attr_dev(td0, "class", "svelte-18m2d13");
    			add_location(td0, file$2, 30, 4, 929);
    			attr_dev(td1, "class", "svelte-18m2d13");
    			add_location(td1, file$2, 31, 4, 958);
    			attr_dev(td2, "class", "text-left svelte-18m2d13");
    			add_location(td2, file$2, 32, 4, 992);
    			attr_dev(tr, "class", "bg-gray-200 svelte-18m2d13");
    			add_location(tr, file$2, 29, 3, 900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t0_value !== (t0_value = /*shortcut*/ ctx[2].keys + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$text*/ 1 && t2_value !== (t2_value = /*shortcut*/ ctx[2].condition + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$text*/ 1 && t4_value !== (t4_value = /*shortcut*/ ctx[2].description + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(29:2) {#each $text.shortcuts_table.ram_editing.shortcuts as shortcut}",
    		ctx
    	});

    	return block;
    }

    // (5:0) <Section title={"Keyboard shortcuts"} h={2}>
    function create_default_slot$2(ctx) {
    	let table;
    	let tr0;
    	let th0;
    	let t0_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.title + "";
    	let t0;
    	let t1;
    	let colgroup;
    	let col0;
    	let t2;
    	let col1;
    	let t3;
    	let col2;
    	let t4;
    	let tr1;
    	let th1;
    	let t5_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.headers.keys + "";
    	let t5;
    	let t6;
    	let th2;
    	let t7_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.headers.condition + "";
    	let t7;
    	let t8;
    	let th3;
    	let t9_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.headers.description + "";
    	let t9;
    	let t10;
    	let table_class_value;
    	let each_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.shortcuts;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			t0 = text$1(t0_value);
    			t1 = space();
    			colgroup = element("colgroup");
    			col0 = element("col");
    			t2 = space();
    			col1 = element("col");
    			t3 = space();
    			col2 = element("col");
    			t4 = space();
    			tr1 = element("tr");
    			th1 = element("th");
    			t5 = text$1(t5_value);
    			t6 = space();
    			th2 = element("th");
    			t7 = text$1(t7_value);
    			t8 = space();
    			th3 = element("th");
    			t9 = text$1(t9_value);
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "colspan", "3");
    			attr_dev(th0, "class", "svelte-18m2d13");
    			add_location(th0, file$2, 7, 3, 256);
    			attr_dev(tr0, "class", "bg-gray-400 svelte-18m2d13");
    			add_location(tr0, file$2, 6, 2, 228);
    			attr_dev(col0, "class", "w-44 rounded-t");
    			add_location(col0, file$2, 13, 3, 448);
    			attr_dev(col1, "class", "w-32");
    			add_location(col1, file$2, 14, 3, 482);
    			attr_dev(col2, "class", "w-[37rem] text-left");
    			add_location(col2, file$2, 15, 3, 506);
    			add_location(colgroup, file$2, 12, 2, 434);
    			attr_dev(th1, "class", "svelte-18m2d13");
    			add_location(th1, file$2, 18, 3, 586);
    			attr_dev(th2, "class", "svelte-18m2d13");
    			add_location(th2, file$2, 21, 3, 656);
    			attr_dev(th3, "class", "text-left svelte-18m2d13");
    			add_location(th3, file$2, 24, 3, 731);
    			attr_dev(tr1, "class", "bg-gray-400 svelte-18m2d13");
    			add_location(tr1, file$2, 17, 2, 558);
    			attr_dev(table, "class", table_class_value = "text-center border-collapse shadow-lg " + /*$$props*/ ctx[1].class);
    			add_location(table, file$2, 5, 1, 156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(th0, t0);
    			append_dev(table, t1);
    			append_dev(table, colgroup);
    			append_dev(colgroup, col0);
    			append_dev(colgroup, t2);
    			append_dev(colgroup, col1);
    			append_dev(colgroup, t3);
    			append_dev(colgroup, col2);
    			append_dev(table, t4);
    			append_dev(table, tr1);
    			append_dev(tr1, th1);
    			append_dev(th1, t5);
    			append_dev(tr1, t6);
    			append_dev(tr1, th2);
    			append_dev(th2, t7);
    			append_dev(tr1, t8);
    			append_dev(tr1, th3);
    			append_dev(th3, t9);
    			append_dev(table, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t0_value !== (t0_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$text*/ 1 && t5_value !== (t5_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.headers.keys + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$text*/ 1 && t7_value !== (t7_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.headers.condition + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*$text*/ 1 && t9_value !== (t9_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.headers.description + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*$text*/ 1) {
    				each_value = /*$text*/ ctx[0].shortcuts_table.ram_editing.shortcuts;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$$props*/ 2 && table_class_value !== (table_class_value = "text-center border-collapse shadow-lg " + /*$$props*/ ctx[1].class)) {
    				attr_dev(table, "class", table_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(5:0) <Section title={\\\"Keyboard shortcuts\\\"} h={2}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				title: "Keyboard shortcuts",
    				h: 2,
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope, $$props, $text*/ 35) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
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
    	let $text;
    	validate_store(text, 'text');
    	component_subscribe($$self, text, $$value => $$invalidate(0, $text = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('KeyboardShortcuts', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ text, Section, $text });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$text, $$props];
    }

    class KeyboardShortcuts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyboardShortcuts",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\manual\components\sections\FileSynthax.svelte generated by Svelte v3.55.0 */
    const file$1 = "src\\manual\\components\\sections\\FileSynthax.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (6:1) {#each $text.sections.code_files.subsections.code_files.paragraphs as paragraph}
    function create_each_block_2(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text$1(t_value);
    			add_location(p, file$1, 6, 2, 267);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*paragraph*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(6:1) {#each $text.sections.code_files.subsections.code_files.paragraphs as paragraph}",
    		ctx
    	});

    	return block;
    }

    // (5:0) <Section title={$text.sections.code_files.subsections.code_files.title}>
    function create_default_slot_2$1(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*$text*/ ctx[0].sections.code_files.subsections.code_files.paragraphs;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1) {
    				each_value_2 = /*$text*/ ctx[0].sections.code_files.subsections.code_files.paragraphs;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(5:0) <Section title={$text.sections.code_files.subsections.code_files.title}>",
    		ctx
    	});

    	return block;
    }

    // (11:1) {#each $text.sections.code_files.subsections.new_lines.paragraphs as paragraph}
    function create_each_block_1(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text$1(t_value);
    			add_location(p, file$1, 11, 2, 461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*paragraph*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(11:1) {#each $text.sections.code_files.subsections.new_lines.paragraphs as paragraph}",
    		ctx
    	});

    	return block;
    }

    // (10:0) <Section title={$text.sections.code_files.subsections.new_lines.title}>
    function create_default_slot_1$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*$text*/ ctx[0].sections.code_files.subsections.new_lines.paragraphs;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1) {
    				each_value_1 = /*$text*/ ctx[0].sections.code_files.subsections.new_lines.paragraphs;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(10:0) <Section title={$text.sections.code_files.subsections.new_lines.title}>",
    		ctx
    	});

    	return block;
    }

    // (16:1) {#each $text.sections.code_files.subsections.syntax.paragraphs as paragraph}
    function create_each_block(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text$1(t_value);
    			add_location(p, file$1, 16, 2, 649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*paragraph*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:1) {#each $text.sections.code_files.subsections.syntax.paragraphs as paragraph}",
    		ctx
    	});

    	return block;
    }

    // (15:0) <Section title={$text.sections.code_files.subsections.syntax.title}>
    function create_default_slot$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*$text*/ ctx[0].sections.code_files.subsections.syntax.paragraphs;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1) {
    				each_value = /*$text*/ ctx[0].sections.code_files.subsections.syntax.paragraphs;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(15:0) <Section title={$text.sections.code_files.subsections.syntax.title}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section0;
    	let t0;
    	let section1;
    	let t1;
    	let section2;
    	let current;

    	section0 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.code_files.subsections.code_files.title,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.code_files.subsections.new_lines.title,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section2 = new Section({
    			props: {
    				title: /*$text*/ ctx[0].sections.code_files.subsections.syntax.title,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section0.$$.fragment);
    			t0 = space();
    			create_component(section1.$$.fragment);
    			t1 = space();
    			create_component(section2.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(section1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(section2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section0_changes = {};
    			if (dirty & /*$text*/ 1) section0_changes.title = /*$text*/ ctx[0].sections.code_files.subsections.code_files.title;

    			if (dirty & /*$$scope, $text*/ 257) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};
    			if (dirty & /*$text*/ 1) section1_changes.title = /*$text*/ ctx[0].sections.code_files.subsections.new_lines.title;

    			if (dirty & /*$$scope, $text*/ 257) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};
    			if (dirty & /*$text*/ 1) section2_changes.title = /*$text*/ ctx[0].sections.code_files.subsections.syntax.title;

    			if (dirty & /*$$scope, $text*/ 257) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(section1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(section2, detaching);
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
    	let $text;
    	validate_store(text, 'text');
    	component_subscribe($$self, text, $$value => $$invalidate(0, $text = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FileSynthax', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FileSynthax> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Section, text, $text });
    	return [$text];
    }

    class FileSynthax extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileSynthax",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\manual\components\MainTabView.svelte generated by Svelte v3.55.0 */

    // (17:2) <Tab class="border-t border-t-gray-500">
    function create_default_slot_12(ctx) {
    	let t_value = /*$text*/ ctx[0].sections.introduction.title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*$text*/ ctx[0].sections.introduction.title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(17:2) <Tab class=\\\"border-t border-t-gray-500\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:2) <Tab>
    function create_default_slot_11(ctx) {
    	let t_value = /*$text*/ ctx[0].sections.instruction_set.title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*$text*/ ctx[0].sections.instruction_set.title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(18:2) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (20:2) <Tab>
    function create_default_slot_10(ctx) {
    	let t_value = /*$text*/ ctx[0].sections.keyboard_shortcuts.title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*$text*/ ctx[0].sections.keyboard_shortcuts.title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(20:2) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (21:2) <Tab>
    function create_default_slot_9(ctx) {
    	let t_value = /*$text*/ ctx[0].sections.code_files.title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*$text*/ ctx[0].sections.code_files.title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(21:2) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (22:2) <Tab>
    function create_default_slot_8(ctx) {
    	let t_value = /*$text*/ ctx[0].sections.examples.title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text$1(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$text*/ 1 && t_value !== (t_value = /*$text*/ ctx[0].sections.examples.title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(22:2) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (16:1) <TabList class="mt-4">
    function create_default_slot_7(ctx) {
    	let tab0;
    	let t0;
    	let tab1;
    	let t1;
    	let tab2;
    	let t2;
    	let tab3;
    	let t3;
    	let tab4;
    	let current;

    	tab0 = new Tab_1({
    			props: {
    				class: "border-t border-t-gray-500",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab_1({
    			props: {
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab2 = new Tab_1({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab3 = new Tab_1({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab4 = new Tab_1({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t0 = space();
    			create_component(tab1.$$.fragment);
    			t1 = space();
    			create_component(tab2.$$.fragment);
    			t2 = space();
    			create_component(tab3.$$.fragment);
    			t3 = space();
    			create_component(tab4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tab1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tab2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tab3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tab4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope, $text*/ 3) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope, $text*/ 3) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    			const tab2_changes = {};

    			if (dirty & /*$$scope, $text*/ 3) {
    				tab2_changes.$$scope = { dirty, ctx };
    			}

    			tab2.$set(tab2_changes);
    			const tab3_changes = {};

    			if (dirty & /*$$scope, $text*/ 3) {
    				tab3_changes.$$scope = { dirty, ctx };
    			}

    			tab3.$set(tab3_changes);
    			const tab4_changes = {};

    			if (dirty & /*$$scope, $text*/ 3) {
    				tab4_changes.$$scope = { dirty, ctx };
    			}

    			tab4.$set(tab4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			transition_in(tab2.$$.fragment, local);
    			transition_in(tab3.$$.fragment, local);
    			transition_in(tab4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			transition_out(tab2.$$.fragment, local);
    			transition_out(tab3.$$.fragment, local);
    			transition_out(tab4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tab1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tab2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tab3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tab4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(16:1) <TabList class=\\\"mt-4\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <TabPanel>
    function create_default_slot_6(ctx) {
    	let introduction;
    	let current;
    	introduction = new Introduction({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(introduction.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(introduction, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(introduction.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(introduction.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(introduction, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(25:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (28:2) <TabPanel>
    function create_default_slot_5(ctx) {
    	let instructionsetsection;
    	let current;
    	instructionsetsection = new InstructionSet({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(instructionsetsection.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(instructionsetsection, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(instructionsetsection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(instructionsetsection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(instructionsetsection, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(28:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (34:2) <TabPanel>
    function create_default_slot_4(ctx) {
    	let keyboardshortcuts;
    	let current;
    	keyboardshortcuts = new KeyboardShortcuts({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(keyboardshortcuts.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(keyboardshortcuts, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keyboardshortcuts.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keyboardshortcuts.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keyboardshortcuts, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(34:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (37:2) <TabPanel>
    function create_default_slot_3(ctx) {
    	let filesynthax;
    	let current;
    	filesynthax = new FileSynthax({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(filesynthax.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filesynthax, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filesynthax.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filesynthax.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(filesynthax, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(37:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (40:2) <TabPanel>
    function create_default_slot_2(ctx) {
    	let examples;
    	let current;
    	examples = new Examples({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(examples.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(examples, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(examples.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(examples.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(examples, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(40:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (24:1) <TabPanels class="py-7 px-14">
    function create_default_slot_1(ctx) {
    	let tabpanel0;
    	let t0;
    	let tabpanel1;
    	let t1;
    	let tabpanel2;
    	let t2;
    	let tabpanel3;
    	let t3;
    	let tabpanel4;
    	let current;

    	tabpanel0 = new TabPanel_1({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel1 = new TabPanel_1({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel2 = new TabPanel_1({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel3 = new TabPanel_1({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel4 = new TabPanel_1({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabpanel0.$$.fragment);
    			t0 = space();
    			create_component(tabpanel1.$$.fragment);
    			t1 = space();
    			create_component(tabpanel2.$$.fragment);
    			t2 = space();
    			create_component(tabpanel3.$$.fragment);
    			t3 = space();
    			create_component(tabpanel4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabpanel0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tabpanel1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tabpanel2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tabpanel3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tabpanel4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabpanel0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tabpanel0_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel0.$set(tabpanel0_changes);
    			const tabpanel1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tabpanel1_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel1.$set(tabpanel1_changes);
    			const tabpanel2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tabpanel2_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel2.$set(tabpanel2_changes);
    			const tabpanel3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tabpanel3_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel3.$set(tabpanel3_changes);
    			const tabpanel4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tabpanel4_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel4.$set(tabpanel4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabpanel0.$$.fragment, local);
    			transition_in(tabpanel1.$$.fragment, local);
    			transition_in(tabpanel2.$$.fragment, local);
    			transition_in(tabpanel3.$$.fragment, local);
    			transition_in(tabpanel4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabpanel0.$$.fragment, local);
    			transition_out(tabpanel1.$$.fragment, local);
    			transition_out(tabpanel2.$$.fragment, local);
    			transition_out(tabpanel3.$$.fragment, local);
    			transition_out(tabpanel4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabpanel0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tabpanel1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabpanel2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tabpanel3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tabpanel4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(24:1) <TabPanels class=\\\"py-7 px-14\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:0) <TabGroup class="p-5">
    function create_default_slot(ctx) {
    	let tablist;
    	let t;
    	let tabpanels;
    	let current;

    	tablist = new TabList_1({
    			props: {
    				class: "mt-4",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanels = new TabPanels_1({
    			props: {
    				class: "py-7 px-14",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablist.$$.fragment);
    			t = space();
    			create_component(tabpanels.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablist, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(tabpanels, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablist_changes = {};

    			if (dirty & /*$$scope, $text*/ 3) {
    				tablist_changes.$$scope = { dirty, ctx };
    			}

    			tablist.$set(tablist_changes);
    			const tabpanels_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tabpanels_changes.$$scope = { dirty, ctx };
    			}

    			tabpanels.$set(tabpanels_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablist.$$.fragment, local);
    			transition_in(tabpanels.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablist.$$.fragment, local);
    			transition_out(tabpanels.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablist, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(tabpanels, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(15:0) <TabGroup class=\\\"p-5\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let tabgroup;
    	let current;

    	tabgroup = new TabGroup_1({
    			props: {
    				class: "p-5",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabgroup_changes = {};

    			if (dirty & /*$$scope, $text*/ 3) {
    				tabgroup_changes.$$scope = { dirty, ctx };
    			}

    			tabgroup.$set(tabgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabgroup, detaching);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let $text;
    	validate_store(text, 'text');
    	component_subscribe($$self, text, $$value => $$invalidate(0, $text = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainTabView', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainTabView> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		TabGroup: TabGroup_1,
    		TabList: TabList_1,
    		Tab: Tab_1,
    		TabPanels: TabPanels_1,
    		TabPanel: TabPanel_1,
    		text,
    		InstructionSetSection: InstructionSet,
    		Introduction,
    		Examples,
    		KeyboardShortcuts,
    		FileSynthax,
    		$text
    	});

    	return [$text];
    }

    class MainTabView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainTabView",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\manual\App.svelte generated by Svelte v3.55.0 */
    const file = "src\\manual\\App.svelte";

    function create_fragment(ctx) {
    	let title_value;
    	let t0;
    	let header;
    	let t1;
    	let main;
    	let maintabview;
    	let current;
    	document.title = title_value = "" + (/*$text*/ ctx[0].page_title + " - CPU Visual Simulator");
    	header = new Header({ $$inline: true });
    	maintabview = new MainTabView({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			main = element("main");
    			create_component(maintabview.$$.fragment);
    			add_location(main, file, 10, 0, 273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(maintabview, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$text*/ 1) && title_value !== (title_value = "" + (/*$text*/ ctx[0].page_title + " - CPU Visual Simulator"))) {
    				document.title = title_value;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(maintabview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(maintabview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(maintabview);
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
    	let $text;
    	validate_store(text, 'text');
    	component_subscribe($$self, text, $$value => $$invalidate(0, $text = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, MainTabView, text, $text });
    	return [$text];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    init$1();
    init();
    var main = new App({
        target: document.body
    });

    return main;

})();
//# sourceMappingURL=manual.bundle.js.map
