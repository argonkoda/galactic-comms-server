# Contributing

## Bug Reports / Feature Requests
For those wanting to report a bug or request a feature please create an issue in the Issues tab of the repository and label it appropriately. Before doing so however, make sure there aren't other issues already describing the bug or feature you have. Make sure to disable the `is:open` filter as the issue may have been fixed in a future release. If there is a pre-existing issue and you have more details to add, feel free to leave a comment providing those details.

## Pull Requests
If you have implemented a new feature or fixed a bug make sure to create a pull request to merge. The branch semantics are as follows:
- `main` The latest working release. This should only be merged into from `develop` or `hotfix-` branches.
- `develop` The active development version of the repo. This is the default branch.
- `hotfix-xxx` These branches are created when a hotfix is needed. If a major bug is discovered after a release then fixes will be made in a hotfix branch and merged directly into `main` once complete.
- `bugfix-xxx` These branches are for implementing bug fixes. (`xxx` should be replaced with an issue number for the bug it fixes.)
- `feature-xxx` These branches are for implementing new features. (`xxx` should be replaced with an issue number for the feature request it addresses.)
- `docs-xxx` These branches are for making changes to documentation for the project. (`xxx` should be replaced with an issue number for the docs issue it addresses.)

## Commits
To ensure some level of consistency please use [**conventional commits**](https://www.conventionalcommits.org/en/v1.0.0/). There are extensions available for VSCode and other IDEs that make this process easy.

Also please try to commit with well sized commits. That is, don't commit with 4 features a bugfix and some style changes. Split them up into individual commits.

## Versioning
This repo follows [SemVer](http://semver.org/). Conventional Commits describes the mapping between `fix` `feat` and `BREAKING CHANGE` to the different version levels.

## Releases
Initially releases will be mediated by [@Someoneamzing](github.com/someoneamzing) (The author of the repo). This prevents situations where releases are made too early or include bad code. If the project grows to a point where this becomes infeasible then other options will be explored.

Documentation and other repository only changes will never constitute a release or SemVer increase unless it is part of the final UI.