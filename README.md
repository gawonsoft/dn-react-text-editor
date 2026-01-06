# React Store Input

The goal of this package is to make state management easier when using input elements in React.

It eliminates repetitive code required to implement state changes and subscriptions for input elements, and provides a simple interface.

At the same time, it allows you to use all the attributes originally provided by the input tag as-is, without needing to learn this package.

## Get Started

This is a simple example of how to use this package.

```tsx
import { useFormStore } from "dn-react-input";

export default function App() {
    const store = useFormStore({
        email: "",
        password: "",
    });

    const submit = async () => {
        const { email, password } = store.state;

        alert(`Email: ${email}\nPassword: ${password}`);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <store.input name="email" type="email" />
            <store.input name="password" type="password" />
            <button type="submit">Submit</button>
        </form>
    );
}
```

## How to define state?

You can define any state you want as an object when calling `useStore`.

```tsx
function Component() {
    ...

    const store = useStore({
        email: "",
        password: "",
        rememberMe: false,
    });

    ...
}
```

It's a single source of truth for your form state.

## How to get input values?

You can access the current values of the input elements through the `state` property of the store.

```tsx
function Component() {
    ...

    const submit = () => {
        const { email, password, rememberMe } = store.state;
    };

    ...
}
```

## How to add input elements?

You can add input elements using the `Input` component provided by the store. There are 'Select' and 'Textarea' components as well.

```tsx
import { Input } from "dn-react-input";

function Component() {
    ...

    return (
        <form>
            <Input store={store} name="email" type="email" />
            <Input store={store} name="password" type="password" />
            <Input store={store} name="rememberMe" type="checkbox" />
        </form>
    );
}
```

If you want to avoid passing the store to each input component, use `useStoreInput`. This hook provides input components that are already connected to the store.

```tsx
import { useStoreInput } from "dn-react-input";

function Component() {
    ...
    const Input = useStoreInput(store);

    return (
        <form>
            <Input.input name="email" type="email" />
            <Input.input name="password" type="password" />
            <Input.input name="rememberMe" type="checkbox" />
        </form>
    );
}
```

`useFormStore` is a facade that combines `useStore` and `useStoreInput` for convenience.

```tsx
import { useFormStore } from "dn-react-input";

function Component() {
    ...
    const store = useFormStore({
        email: "",
        password: "",
        rememberMe: false,
    });

    return (
        <form>
            <store.input name="email" type="email" />
            <store.input name="password" type="password" />
            <store.input name="rememberMe" type="checkbox" />
        </form>
    );
}
```

## How to render components on state changes?

If you want to render a component only when specific parts of the state change, use the `useSelector` hook.

```tsx
import { useSelector } from "dn-react-input";

function Component() {
    ...
    const email = useSelector(store, (state) => state.email);

    return <div>Your email is: {email}</div>;
}
```

If you want to render components in an inline manner, use the `createRender` function. By using this, you can avoid creating separate components for each part of the state you want to track.

```tsx
import { createRender } from "dn-react-input";

function Component() {
    ...
    return (
        <div>
            {createRender(store, (state) => <p>{state.email}</p>)}
            {createRender(store, (state) => <p>{state.password}</p>)}
        </div>
    );
}
```

## How to subscribe to state changes?

You can subscribe to state changes using the `subscribe` method of the store.

```tsx
function Component() {
    ...
    useEffect(() => {
        const unsubscribe = store.subscribe((state) => {
            console.log(`State changed`, state);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    ...
}
```

## How to update state manually?

You can update the state manually using the `dispatch` method of the store.

```tsx
function Component() {
    ...
    const updateEmail = () => {
        store.dispatch({ email: "ohjinsu98@icloud.com" });
    };

    return <button onClick={updateEmail}>Update Email</button>;
}
```

The `dispatch` method uses immerjs internally to update the state, so you can also use a function to update the state based on the previous state.

```tsx
function Component() {
    ...

    const updateEmail = () => {
        store.dispatch((state) => {
            state.email = "ohjinsu98@icloud.com";
        });
    };

    return <button onClick={updateEmail}>Update Email</button>;
}
```
