# 3DModels-To-GIF Generator

Creates a GIF of a supported 3D File with rotation around its axis.

## Examples

<p align="left">
    <img src="https://github.com/StaticFX/3DModels-To-GIF/blob/master/examples/example-cat.gif?raw=true" width="200" height="200" />
    <img src="https://github.com/StaticFX/3DModels-To-GIF/blob/master/examples/example-eiffel-tower.gif?raw=true" width="200" height="200" />
    <img src="https://github.com/StaticFX/3DModels-To-GIF/blob/master/examples/example-moai.gif?raw=true" width="200" height="200" />
</p>



## Supported File Types

Currently these file extensions are support: **.stl, .obj**

## Installation Instructions for development

Clone this project using git

```bash
git clone https://github.com/StaticFX/3DModels-To-GIF
```

### OSX

The following programs are required to build the project:

1. [Xcode](https://apps.apple.com/de/app/xcode/id497799835?mt=12)
2. Python 2.7 use [PyEnv](https://github.com/pyenv/pyenv) with [Homebrew](https://brew.sh/) for easy installation

### Windows

The following programs are required to build the project:

1. [Visual Studio](https://visualstudio.microsoft.com/)
2. Python 2.7
3. Python 3 and up
4. C++ Desktop Development Kit found in Visual Studio installation manager

The above mentioned programs are required to build gl, the rendering library used to convert three.js scenes into images.

After installing all programs run:

```bash
npm i
```

To run the server use:

```bash
npm run dev
```

## How it works

There were a few issues that needed to be resolved before this could work. The initial idea was always to use three.js as the library to build the model. The only problem was that three.js was made for webbrowsers and not for nodejs. Therefore we are using gl, which is a headless renderer to render our images.
In a nutshell it works by, loading in the 3d model, centering it into the scene and rotating it to be at an angle. Then the distance of the camera is calculated and moved to have the whole model visible. The scene is then being rotated around its axis. Every given angle the renderer renders an image of the current scene. All images are then combined into a .gif file.
