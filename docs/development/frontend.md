---
title: Frontend guide
icon: paintbrush
order: 80
---

# Frontend guide

!!!info Info
Coming soon
!!!

## Code linting

- **prettier**
- **eslint**

## Run tests

### Unit tests

```sh
npm run test
```

or with coverage:

```sh
npm run test:coverage
```

### Integration tests

```sh
npm run cypress:run:component
```

### E2E tests

```sh
npm run cypress:run:e2e
```

### How to create more E2E tests

- Select the spec (test file) you want to verify (in `/tests/e2e/`)
![](../media/tests/cypress_e2e_1.png)

- Enable the selector button to get the selector to use in the test
![](../media/tests/cypress_e2e_2.png)

- Choose the element in the application you want to retrieve
![](../media/tests/cypress_e2e_3.png)

Now we can:

- verify if the content is correct:
```cy.get("...").should("have.text", "Account");```
- verify the same thing but for inputs:
```cy.get("...").should("have.value", "some value");```
- and also trigger a click:
```cy.get("...").click()```

Full documentation: https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test