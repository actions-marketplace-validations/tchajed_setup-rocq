# setup-rocq

![Linter](https://github.com/tchajed/setup-rocq/actions/workflows/linter.yml/badge.svg)
![CI](https://github.com/tchajed/setup-rocq/actions/workflows/ci.yml/badge.svg)
![Check dist/](https://github.com/tchajed/setup-rocq/actions/workflows/check-dist.yml/badge.svg)
![CodeQL](https://github.com/tchajed/setup-rocq/actions/workflows/codeql-analysis.yml/badge.svg)

GitHub action to install Rocq with opam. Supports caching of opam dependencies.

## Usage

```yaml
- uses: tchajed/setup-rocq@v1
  with:
    rocq-version: 'latest' # default
```

## Configuration

### Inputs

| Input               | Description                                                | Required | Default  |
| ------------------- | ---------------------------------------------------------- | -------- | -------- |
| `rocq-version`      | The version of Rocq to install                             | No       | `latest` |
| `opam-repositories` | Additional opam repositories to add (YAML name:url object) | No       | `''`     |

`rocq-version` supports these special strings, in addition to full Rocq versions (as used by `opam install`):

- "latest" installs the most recent stable release
- "dev" installs the latest git version of Rocq
- "weekly" installs the git version of Rocq from this Monday

### Examples

```yaml
- uses: tchajed/setup-rocq@v1
  with:
    rocq-version: dev
    opam-repositories: |
      iris-dev: https://gitlab.mpi-sws.org/iris/opam.git
```
