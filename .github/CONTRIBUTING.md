# Contributing to Material Tools for AngularJS Material

 - [Code of Conduct](#coc)
 - [Signing the CLA](#cla)<br/><br/>
 - [Question or Problem?](#question)
 - [Issues and Bugs](#bug)
   - [Enhancement Requests](#feature)
   - [Issue Guidelines](#submit)
 - [Git Commit Guidelines](#commit)
 - [Submission Guidelines](#submit)

## <a name="coc"></a> Code of Conduct

Please help us keep AngularJS Material open and inclusive by reading and following our
[Code of Conduct](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md).

Please note that by using GitHub, you have also agreed to follow the
[GitHub Terms of Service](https://help.github.com/en/articles/github-terms-of-service#) which
include [guidelines on conduct](https://help.github.com/en/articles/github-terms-of-service#3-conduct-restrictions). 

We are care deeply about our inclusive community and diverse group of members. As part of this,
we do take time away from development to enforce this policy through interventions in heated
discussions, one-on-one discussions to explain the policy to violators, and bans for repeat
violators.

## <a name="question"></a> Have a Question, Problem, or Idea?

If you have questions or ideas regarding Material Tools for AngularJS Material, please direct these to the
[AngularJS Material Forum](https://groups.google.com/forum/#!forum/ngmaterial).

Otherwise, do you:

- [Want to report a Bug?](#bug)
- [Want to request an Enhancement?](#feature)

#### <a name="bug"></a> 1. Want to report a Bug or Issue?

If the issue can be reproduced using the latest `master` version of Material Tools and AngularJS Material,
you can help us by submitting an issue to our
[GitHub Repository](https://github.com/angular/material-tools/issues/new/choose).

After we triage the issue and apply labels to it, we invite you to submit a **Pull Request** with a proposed
fix. Your custom changes can be crafted in a repository fork and submitted to our
[GitHub Repository](https://github.com/angular/material-tools/compare) as a Pull Request.


**Important**: Please review the [Submission Guidelines](#submit) below, before contributing to the
  project.

#### <a name="feature"></a> 2. Want to request an Enhancement?

You can request an enhancement by
[submitting an issue](https://github.com/angular/material-tools/issues/new/choose). After submitting an issue,
if you would like to implement an enhancement then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first on our
  [AngularJS Material Forum](https://groups.google.com/forum/#!forum/ngmaterial), so that we can better
  coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is
  successfully accepted into the project.
* **Small Changes** can be crafted and submitted to the
  [GitHub Repository](https://github.com/angular/material-tools/compare) as a Pull Request.

## <a name="submit"></a> Issue Guidelines

We welcome your enhancement requests, doc improvements, and issue reports.
However, we are not accepting major feature requests at this time.
 
If you're thinking about contributing code or documentation to the
project, please review [Submitting Pull Requests](#submitpr) before beginning any work.

#### Submitting an Issue

Before you submit an issue,
**[search](https://github.com/angular/material-tools/issues?q=is%3Aissue+is%3Aopen)** the issues archive;
maybe the issue has already been submitted or considered. If the issue appears to be a bug,
and hasn't been reported, open a [new issue](https://github.com/angular/material-tools/issues/new/choose).

> Please **do not report duplicate issues**; help us maximize the effort we can spend fixing
issues and adding enhancements.

Providing the following information will increase our ability to resolve your issue efficiently:

* **Issue Title** - provide a concise issue title prefixed with a snake-case name of the
                    associated class (if any): `<class-name>: <issue title>`.

  > e.g.
  > *  material-builder: output contains outdated copyright year

* **Complete the full Issue Template** - GitHub now supports issue templates and Material Tools for AngularJS
    Material provides options to make submitting an issue with the required information more straightforward.

* **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
  causing the problem (line of code or commit).

#### <a name="submitpr"></a>Submitting Pull Requests

**Important**: We are not accepting major feature requests or PRs that contain major new features
 or breaking changes at this time.

Please check with us via [the discussion forum](https://groups.google.com/forum/#!forum/ngmaterial)
before investing significant effort in a planned Pull Request submission; it's possible that we are
already working on a related PR or have decided that the enhancement does not belong in the core
AngularJS Material project.

* Submit proposed changes or additions as GitHub pull requests and fill out the pull request template.

<br/>

## <a name="commit"></a> Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted. This leads to **more
readable messages** that are easy to follow when looking through the **project history**. 

### <a name="commit-message-format"></a> Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special
format that includes a **type**, a **scope**, and a **subject**:

```html
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

> Any line of the commit message cannot be longer 100 characters!<br/>
  This allows the message to be easier to read on GitHub as well as in various Git tools.

##### Type

Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the auxiliary tools such as release scripts
* **build**: Changes to the dependencies, devDependencies, or build tooling
* **ci**: Changes to our Continuous Integration configuration

##### Scope

The scope could be anything that helps specify the scope (or feature) that is changing.

Examples
- fix(material-builder): 
- test(virtual-context): 

##### Subject

The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no period (.) at the end

##### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

##### Footer

The footer is the place to reference GitHub issues that this commit **Closes**, **Fixes**, or **Relates to**.

##### Sample Commit messages

```text
fix(theme-builder): provide an initial value in case reducing an empty array

- no longer throw an exception if no themes are passed in 

Fixes #44
```

<br/>

## <a name="cla"></a> Signing the CLA

Please sign our Contributor License Agreement (CLA) before sending pull requests. For any code
changes to be accepted, the CLA must be signed. It's a quick process, we promise!

To learn more and sign the CLA, visit [cla.developers.google.com](http://cla.developers.google.com).
