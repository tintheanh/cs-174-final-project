# Neural_Network
Neural Network from scratch done in python using numpy made for the mnist dataset
to install the required libraries navigate to the folder that contains the requirement.txt folder via the command line and run this line `pip install -r requirements.txt --no-index --find-links file:///tmp/packages`
python version should be above 3.0

to train a model run from cmd line `python3 neural_net.py num_hidden_layers width activation_func learning_rate dropout epochs netName`
where `num_hidden_layers` is 1-2 width is between 10 and 200 `activation_func` is `ReLU` or `Sigmoid`. if `ReLU` learning rate must be between 0.001 and 0.01 if `Sigmoid` learning rate must be between 0.1 and 1. If `ReLU` dropout can be between 0 and 0.7 if `Sigmoid` dropout must be 0 epochs can be between 10 and 150 good starting point is 40 netName is the name of the neural net which is returned upon completion of the run.

to get a prediction run from cmd line `python3 neural_net.py path_to_img netName` where path_to_img is the absolute path to an image and netName is the name of the file containing the net returned by the first command the result of this call is of the form `value,probability` in string form
