# setup-ga

This action sets up `ga` which is the GitHub Actions helper command-line tool.

See [github.com/superbrothers/ga](https://github.com/superbrothers/ga) for more details.

## Usage

See [action.yaml](./action.yml).

```yaml
steps:
- uses: actions/checkout@v2
- uses: superbrothers/setup-ga@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Avoid rate limit error
- run: |
    version=$(cat VERSION)
    ga set-output version "$version"
  id: get_version
- name: Create Release
  uses: actions/create-release@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    tag_name: ${{ steps.get_version.outputs.version }}
    release_name: ${{ steps.get_version.outputs.version }}
```

This action supports only GNU/Linux environment. If you want to use it on other platforms, you can install ga directly to your environment:
```
jobs:
  run:
    runs-on: windows-latest
    steps:
    - uses: actions/checkout@v2
    - uses: setup-node
      with:
        node-version: "12.x"
    - name: Install ga
      run: |
        npm install -g @superbrothers/ga
    - run: |
        version=$(cat VERSION)
        ga set-output version "$version"
```

## License

This software is released under the MIT License.
