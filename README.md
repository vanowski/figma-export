# Figma Export
The main goal of this tool is to simplify the interaction between designers and front-end developers and enable stack mirroring, i. e. try and preserve as much consistency as possible in terms of asset naming and architecture.

## Why?
As it's been put by John Chours in [this article](https://www.designsystems.com/stack-mirroring-designing-for-code-and-coding-for-design/), *"Design systems are doing what code has been doing for a long time now."* Figma API allows us to automate a lot of small tasks such as exporting colours and fonts that have traditionally been made by hand and were often the major source of small style discrepancies and bugs. Generating these assets from one source of truth (Figma) helps eliminate these issues.

# Prerequisites
Your Figma project that you are going to use as the export source shoulh have named fill and text styles and (optionally) clearly and defined named layers (in case you would also like to generate CSS class structure).

## Setup
```
$ npm install
```

1. Get your personal API token from Figma (available under Help and Account / Account Settings)
2. Add it to `.env` file in the project folder
3. Have your project ID ready (it is the part of project URL that comes after `/file/`, for example in `https://www.figma.com/file/U6RzRwTnN0urJr9xP7LtQJ` it is `U6RzRwTnN0urJr9xP7LtQJ`)

## Exproting colours and typography
Once you have colour and text styles set in the Figma project, you can export them as SCSS variables and mixins.

```
$ gulp variables --fileId=<your_project_ID>
```

This will generate two files in `styles` directory: `colors.scss` and `typography.scss`. All colour values will be converted to `rgba()`, font sizes and line heights to `rem`s.

## Generating CSS classes
If you also want the export tool to generate boilerplate CSS code containg class names and initial properties, use the following workflow:

### Step 1
In your Figma project, give your layers clear names and semantic prefixes:
* `[B]` for BEM block
* `[E]` for BEM element

It should look this:

![Figma Workspace Screenshot](/uploads/3012f6c66969a509572abd8c7b35d6b5/Screenshot_from_2019-05-31_17-59-15.png)

You don't need to name all blocks, just the ones you want to export.

### Step 2
Run the export tool:

```
$ gulp blocks --fileId=<your_project_ID>
```

This will geherate SCSS files in `styles` with class names constructed according to the BEM notation and assumed text colours and typography mixins these classes might require. The whole process might look like this:
![generating_blocks](/uploads/367b5d275849748cbc678bc5727d0831/generating_blocks.gif)

## Defining the export scope
By default the tool scans the whole project tree for colour and font styles which may result in more assets than you've expected or assets that are unnecessary. You can also limit the scanning scope to one particular node (i. e. one layer or frame or page in the Figma project), so only its contents will be scanned for styles and / or blocks.

## Step 1
In your Figma project, pick the desired layer / frame / page / group and add an `[X]` symbol at the beginning its name:

![Screenshot_from_2019-07-26_12-58-30](/uploads/351f86bce657db77a3ef73e77ad80016/Screenshot_from_2019-07-26_12-58-30.png)

## Step 2
Run the export tool with `--entryPoint` key:

```
$ gulp variables --fileId=<your_project_ID> --entryPoint
```

or

```
$ gulp blocks --fileId=<your_project_ID>  --entryPoint
```

or

```
$ gulp all --fileId=<your_project_ID>  --entryPoint
```

## Experimental
If you want to generate boilerplate SCSS code but don't want to spend time preparing your Figma project by adding `[B]` and `[E]` prefixes to indicate BEM blocks and elements, and you have a well-structured project, you can give it a shot and allow export tool automatically create block classes for all frames and component instances. It might produce rather unpredictable results, hence the experimental status of the feature. Run the tool with an `--autoBlocks` key:

```
$ gulp blocks --fileId=<your_project_ID> --autoBlocks
```

## Additional information
More information on BEM structure [here](https://gitlab.l.invia.lan/lighthouse/documentation/blob/master/development_guide/src/02_frontend.adoc).

## TODO
* Detect colours and typography mixins more precise when generating boilerplate code

## Info for developers
[Figma API reference](https://www.figma.com/developers/docs)

This is what the typical project node looks like:

```
{
  absoluteBoundingBox: {
    x: 1.1368683772161603e-13,
    y: 0,
    width: 360,
    height: 376
  },
  background: [
    {
      blendMode: "NORMAL",
      visible: false,
      type: "SOLID",
      color: {}
    }
  ],
  length: 1,
  backgroundColor: {
    r: 0,
    g: 0,
    b: 0,
    a: 0
  },
  blendMode: "PASS_THROUGH",
  children: [
    {
      id: "848:909",
      name: "Shape",
      type: "RECTANGLE",
      blendMode: "PASS_THROUGH",
      "children": []
    },
    {
      id: "848:910",
      name: "[B] Pricing",
      type: "GROUP",
      blendMode: "PASS_THROUGH",
      children: []
    },
    {
      id: "848:917",
      name: "Favorite",
      type: "INSTANCE",
      blendMode: "PASS_THROUGH",
      children: []
    },
    {
      id: "848:918",
      name: "Hotel-Info",
      type: "GROUP",
      blendMode: "PASS_THROUGH",
      children: []
    },
    {
      id: "848:946",
      name: "Image-Gallery",
      type: "FRAME",
      blendMode: "PASS_THROUGH",
      children: []
    }
  ],
  length: 5,
  clipsContent: false,
  constraints: {
    vertical: "TOP",
    horizontal: "LEFT"
  },
  effects: [],
  id: "848:996",
  layoutGrids: [],
  name: "[B] Hotel-Tile",
  type: "COMPONENT"
}
```