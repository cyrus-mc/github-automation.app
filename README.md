#### GitHub Automation


### Teams

Manage GitHub team creation and membership (add and remove) declaratively. Configuration file syntax:

```yaml

teams:
  # list of IDP backed teams to ignore
  idp:
    - teamA
    - teamB
    - ...
    - teamX

  github:
    teamA;
      - memberA
      - ...
      - memberX
    teamX:
      - memberA
      - ...
      - memberX
```
