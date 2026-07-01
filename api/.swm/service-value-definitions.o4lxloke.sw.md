---
title: '[Service] Value Definitions'
---
This is the service used in order to get the definitions and values for every Service. They act as an enum

Get Value Definitions: \[GET\] valueDefinitions/byTypeAndName?type={definition}

<SwmSnippet path="/src/value-definitions/value-definitions.service.ts" line="19">

---

&nbsp;

```typescript
  async getValuesByTypeAndName(type: string, name?: string) {
    const definitionType = await this.definitionTypesService.findOne({
      where: { definitionType: type },
    });

    if (definitionType) {
      const valueDefinitions = await this.repo.findBy({
        valueDefinition: name,
        definitionType: {
          id: definitionType.id,
        },
      });

      return valueDefinitions;
    }
  }
```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBbGF1cmllc2xvdmUtYXBpJTNBJTNBTGF1cmllLXMtTG92ZQ==" repo-name="laurieslove-api"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
