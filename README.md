# Add License Action

**GitHub Action to add a License to a Repository**

This is a GitHub Action that automatically add a specified type of open source license to a repository that does not have a license

## Setup

1. **Add a workflow file** to your project (e.g. `.github/workflows/license.yml`):

   ```yml
   name: Add License

   on:
     push:
       branches:
         - main
         - master

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Setup Node.js
           uses: actions/setup-node@v1
           with:
             node-version: 12.x
         - name: Adding License
           uses: dephraiim/license-action@v1
           with:
             LICENSE_TYPE: MIT
             AUTHOR: Ephraim Atta-Duncan
             PROJECT_NAME: License Action
   ```

## Configuration

### Options

You can configure the action further with the following options:

- `LICENSE_TYPE`: The type of License you want to add to your repo. (default: `MIT`) (required: `false`)
- `AUTHOR`: The Author of the repository. (required: `true`)
- `PROJECT_NAME`: The name of the project. Required by some licenses. (required: `false`)

### License Types

- AGPL
- Apache
- BSD
- CC-BY
- CC-BY-NC
- CC-BY-NC-SA
- CC-BY-SA
- CC0
- GPL
- LGPL
- MIT
- MPL
- Unlicense

## Supported Licenses

The action supports the following licenses:

- [AGPL-3.0](http://www.gnu.org/licenses/agpl-3.0)
- [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [BSD-3.0]()
- [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)
- [CC-BY-NC-4.0](https://creativecommons.org/licenses/by-nc/4.0/)
- [CC-BY-NC-SA-4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
- [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [CC0-1.0](http://creativecommons.org/publicdomain/zero/1.0/)
- [GPL-3.0](http://www.gnu.org/licenses/gpl-3.0)
- [LGPL-3.0](http://www.gnu.org/licenses/lgpl-3.0)
- [MIT](https://opensource.org/licenses/MIT)
- [MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/)
- [Unlicense](http://unlicense.org/)

### Development

Suggestions and contributions are always welcome!

### LICENSE

[MIT](./LICENSE)
