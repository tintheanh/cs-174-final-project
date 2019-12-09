import numpy as np
# from scipy.special import softmax
import os
from PIL import Image
import dill
from sys import argv, stdout
from io import BytesIO
import base64
from dotenv import load_dotenv

# for np array shape is row, column
DEVELOP_MODE = False

load_dotenv()

BASE_PATH = os.getenv("BASE_PATH")

class NeuralNet:
    def __init__(self, input_size, num_hidden_layers, output_size, width, activation_func, loss_func, learning_rate,
                 dropout=0.5):
        self.lr = learning_rate
        self.activations = ["Sigmoid", "ReLU"]
        self.losses = ["CrossEntropy"]
        self.preds = []
        if activation_func not in self.activations:
            print(
                f"error, {activation_func} not a supported activation function")
            return
        if loss_func not in self.losses:
            print(f"error, {loss_func} not a supported loss function")
            return
        if dropout is 1:
            print(f"error, dropout of 1 is not supported dropout must be >=0 and <1")
            raise SystemExit(0)
        self.input_size = input_size
        self.activation_func = activation_func
        self.loss_func = loss_func
        self.num_hidden_layers = num_hidden_layers
        self.output_size = output_size
        self.width = width
        self.dropout = dropout
        self.layers = []
        self.layers.append(Layer("input", activation_func, input_size, width))
        self.layers.append(Layer("hidden", activation_func, input_size, width))
        for i in range(num_hidden_layers-1):
            self.layers.append(Layer("hidden", activation_func, width, width))
        self.layers.append(Layer("output", "Softmax", width, output_size))
        self.output = 0
        self.accuracy = 0
        self.probabilities = []

    def __str__(self):
        str2 = ""
        for i in self.layers:
            str2 += i.layer_type
            str2 += "\n"
            str2 += str(i.weights.shape[0])
            str2 += ", "
            str2 += str(i.weights.shape[1])
            str2 += "\n"
        return str2

    @staticmethod
    def one_hot(y, length=10):
        one_hot_array = []
        for i in y:
            temp = np.zeros(shape=[1, length])
            temp[0][i] = 1
            one_hot_array.append(temp)
        return one_hot_array

    def fit(self, input_tensors, output, epochs=10):
        if len(input_tensors) != len(output):
            print("error size mismatch")
            print(f"size of input {len(input_tensors)}")
            print(f"size of output {len(output)}")
            return
        for i in range(epochs):
            self.train(input_tensors, output, train=True, dropout=self.dropout)
            if DEVELOP_MODE:
                print()
                print(f"Accuracy for epoch {i+1} is {self.accuracy * 100}%")

    def predict(self, input_tensors):
        return self.forward(input_tensors, dropout=0)

    def test(self, input_tensors, output):
        self.train(input_tensors, output, train=False, dropout=self.dropout)
        if DEVELOP_MODE:
            print(f"Accuracy on test set is {self.accuracy * 100}%")

    def train(self, input_tensors, output, train=True, dropout=0.5):
        output_actual = self.one_hot(output)
        output_for_scoring = []
        for j in output:
            output_for_scoring.extend(j)

        self.preds = []
        ct = 0
        for i, k in zip(input_tensors, output_actual):
            ct += 1
            if train:
                out_loc, out_prob = self.forward(i, dropout=dropout)
                self.preds.append(out_loc)
                self.probabilities.append(out_prob)
                self.backward(k)
            else:
                out_loc, out_prob = self.forward(i, dropout=0)
                self.preds.append(out_loc)
                self.probabilities.append(out_prob)
        c = np.equal(self.preds, output_for_scoring)
        f = np.argwhere(c)
        if len(f) is 0:
            self.accuracy = float(0)
        else:
            # print(self.preds)
            # print(output_for_scoring)
            self.accuracy = float((len(f)/len(output_for_scoring)))

    # returns tuple with value and probability predicted

    def forward(self, input_tensors, dropout=0.5):
        out = input_tensors
        for i in self.layers:
            out = i.get_weighted_sum(out, dropout=dropout)
            if i.layer_type is "output":
                temp = np.amax(out)
                temp_loc = np.argmax(out)
                self.output = temp_loc
                return temp_loc, temp

    def backward(self, y):
        output_old_layer = 0
        output_new_weights = 0
        hidden_new_weights = []
        hidden_old_layers = []
        hidden_new_bias = []
        for i in reversed(range(len(self.layers))):
            if self.layers[i].layer_type is "input":
                output_old_layer.weights = output_new_weights
                for j in range(len(hidden_new_weights)):
                    hidden_old_layers[j].weights = hidden_new_weights[j]
                    hidden_old_layers[j].bias = hidden_new_bias[j]

            elif self.layers[i].layer_type is "output":
                threshold = .5
                output_layer = self.layers[i]
                last_hidden_layer = self.layers[i-1]
                # is this predictions - y?
                cross_entropy_grad = output_layer.loss_derivative_function(output_layer.output,
                                                                           np.array([y.argmax()]))

                # softmax_grad = output_layer.softmax_grad(output_layer.output)
                # softmax_grad = gradient_clip(softmax_grad, threshold)
                # output_delta = cross_entropy_grad  @ softmax_grad
                output_delta = output_layer.output - y
                output_weights_deriv = (
                    last_hidden_layer.output.transpose() @ output_delta)
                # output_weights_deriv = gradient_clip(output_weights_deriv, threshold)
                output_new_weights = output_layer.weights - \
                    (self.lr * output_weights_deriv)
                output_layer.delta = output_delta
                output_old_layer = output_layer
            else:
                output_layer = self.layers[i+1]
                hidden_layer = self.layers[i]
                prev_layer = self.layers[i-1]
                hidden_activation_deriv = hidden_layer.activation_function_grad_function(
                    hidden_layer.output)
                hidden_delta = output_layer.delta @ output_layer.weights.transpose()
                hidden_delta = hidden_delta * hidden_activation_deriv
                hidden_layer.delta = hidden_delta
                # hidden_weights_deriv = prev_layer.output.transpose() @ hidden_delta
                hidden_weights_deriv = (
                    prev_layer.output.transpose() @ hidden_delta)
                # hidden_weights_deriv = gradient_clip(hidden_weights_deriv, threshold)
                hidden_bias = hidden_layer.bias - (self.lr * hidden_delta)
                new_weights = hidden_layer.weights - \
                    (self.lr * hidden_weights_deriv)
                hidden_new_weights.append(new_weights)
                hidden_new_bias.append(hidden_bias)
                hidden_old_layers.append(hidden_layer)


class Layer:
    def __init__(self, layer_type, activation_function, input_size, output_size):
        def sigmoid(x):
            # x = np.clip(x, -math.sqrt(3), math.sqrt(3))
            """
            np.where(x >= 0,
                     1 / (1 + np.exp(-x)),
                     np.exp(x) / (1 + np.exp(x)))
                     """
            return 1/(1+np.exp(-x))

        def relu(arr):
            return np.maximum(arr, 0)

        def sigmoid_prime(arr):
            # arr = normalize(arr)
            return arr * (1-arr)

        def reluprime(x):
            return np.where(x > 0, 1.0, 0.0)

        def crossentropyloss(pred, y):
            for i in range(len(pred[0])):
                if i == y:
                    return -np.log(pred[0][i])

        # taken from https://deepnotes.io/softmax-crossentropy
        def delta_cross_entropy(x, y):
            """
            X is the output from fully connected layer (num_examples x num_classes)
            y is labels (num_examples x 1)
            Note that y is not one-hot encoded vector.
            It can be computed as y.argmax(axis=1) from one-hot encoded vectors of labels if required.
            """
            m = y.shape[0]
            grad = x.copy()
            grad[range(m), y] -= 1
            grad = grad / m
            return grad

        def softmax_grad(input1):
            # taken from https://stackoverflow.com/questions/54976533/derivative-of-softmax-function-in-python
            # Reshape the 1-d softmax to 2-d so that np.dot will do the matrix multiplication
            s = input1.reshape(-1, 1)
            return np.diagflat(s) - np.dot(s, s.T)

        self.cross_entropy = delta_cross_entropy
        self.dropout = False
        self.delta = 0
        self.loss = crossentropyloss
        self.loss_derivative_function = delta_cross_entropy
        self.softmax_grad = softmax_grad
        self.layer_type = layer_type
        self.activation_name = activation_function
        if self.activation_name is "Sigmoid":
            self.activation_function = sigmoid
            self.activation_function_grad_function = sigmoid_prime
        else:
            self.activation_function_grad_function = reluprime
            self.activation_function = relu
        self.input_size = input_size
        self.output_size = output_size
        self.weighted_sum = 0
        self.output = 0
        if layer_type is "input":
            np.random.rand(input_size, output_size) * np.sqrt(2/input_size)
            self.weights = np.identity(input_size)
            # self.weights = np.ones(shape=[1, input_size], order='C')
            self.bias = np.zeros(shape=[1, input_size], order='C')
        elif layer_type is "output":
            self.weights = np.random.rand(
                input_size, output_size) * np.sqrt(2/input_size)
            self.bias = np.zeros(shape=[1, output_size])
            # self.bias = np.random.rand(1, output_size)
        elif layer_type is "hidden":
            self.weights = np.random.rand(
                input_size, output_size) * np.sqrt(2/input_size)
            self.bias = np.random.rand(1, output_size)
            # self.bias = np.zeros(shape=[1, output_size])

    @staticmethod
    def stablesoftmax(x):
        """Compute the softmax of vector x in a numerically stable way."""
        shiftx = x - np.max(x)
        exps = np.exp(shiftx)
        return exps / np.sum(exps)

    def get_weighted_sum(self, input_tensor, dropout):
        q = 1-dropout
        scaling_factor = 1/q
        if self.layer_type is "input":
            self.weighted_sum = input_tensor
            # self.weighted_sum = normalize(self.weighted_sum)
            self.output = self.weighted_sum
        else:
            self.weighted_sum = input_tensor @ self.weights
            self.weighted_sum = self.weighted_sum + self.bias
        if self.layer_type is "output":
            self.output = self.stablesoftmax(self.weighted_sum)
            return self.output
        elif self.layer_type is "hidden":
            self.output = self.activation_function(self.weighted_sum)
            mask = np.random.binomial(1, q, size=self.output.shape)
            self.output = self.output * mask * scaling_factor
            # self.output = normalize(self.output)
        return self.output


# for mnist images dimensions are 28x28
class MnistDataset:
    """
    class to make image dataset
    """

    def __init__(self, directory_path):
        self.image_list = []
        self.image_tensors = []
        self.image_labels = []
        excludes = [".DS_Store"]
        s = set(excludes)
        listings = os.scandir(directory_path)
        self.dir_names = []
        for i in listings:
            if i.is_dir():
                self.dir_names.append(i.name)
        for dirs in self.dir_names:
            temp = os.listdir(directory_path+"/"+dirs)
            temp = [x for x in temp if x not in s]
            for i in range(len(temp)):
                self.image_list.append(temp[i])
                self.image_labels.append(dirs)

        for img, DIR in zip(self.image_list, self.image_labels):
            temp = Image.open(fp=directory_path+"/"+DIR+"/"+img).convert("1")
            temp.load()
            # temp.show()
            temp_tensor = np.asarray(temp, dtype="int64")
            temp_tensor = np.reshape(temp_tensor, newshape=(1, 28**2))
            temp.close()
            self.image_tensors.append(temp_tensor)

        for k in range(len(self.image_labels)):
            self.image_labels[k] = [int(self.image_labels[k])]

def save_net(neural_net, filename):
    filehandler = open(
        BASE_PATH+"/nets/"+filename+".pkl", 'wb+')
    dill.dump(neural_net, filehandler, fmode="wb+",
              protocol=dill.HIGHEST_PROTOCOL)
    filehandler.close()


def open_net(filename):
    filehandler = open(
        BASE_PATH+"/nets/"+filename+".pkl", 'rb+')
    net = dill.load(filehandler)
    filehandler.close()
    return net


def gradient_clip(matrix, threshold):
    # threshold must be >0
    for index, value in np.ndenumerate(matrix):
        if value > threshold:
            matrix[index] = threshold
        elif value < (-1 * threshold):
            matrix[index] = -1 * threshold

    return matrix


def normalize(x):
    x = x-x.mean()
    if x.max() is not 0:
        x = x/x.max()
    return x


LOSS_FUNCTION = "CrossEntropy"


def image_to_tensor(path):
    temp = Image.open(fp=path).convert("1")
    temp.load()
    temp = temp.resize((28, 28))
    temp_tensor = np.asarray(temp, dtype="int64")
    temp_tensor = np.reshape(temp_tensor, newshape=(1, 28 ** 2))
    temp.close()
    return temp_tensor


# default values num_hidden_layers=3, width=10, activation_func="ReLU", learning_rate=0.05, dropout=0.5,
#                        epochs=5, net_name="test"
# lr for relu around .004
# lr for sigmoid around .5 takes more epochs to converge cannot do dropout with sigmoid

def make_and_train_net(num_hidden_layers=2, width=200, activation_func="ReLU", learning_rate=0.005, dropout=0.5,
                       epochs=10, net_name="test"):
    input_size = 784
    output_size = 10
    train_data = MnistDataset(
        BASE_PATH+"/trainingSet")
    temp_net = NeuralNet(input_size=input_size, num_hidden_layers=int(num_hidden_layers),
                         output_size=int(output_size), width=int(width), activation_func=activation_func,
                         loss_func=LOSS_FUNCTION, learning_rate=float(learning_rate), dropout=float(dropout))
    temp_net.fit(train_data.image_tensors,
                 train_data.image_labels, epochs=int(epochs))
    save_net(temp_net, net_name)
    return net_name


def predict_image(path, neural_name):
    # temp = Image.open(fp=path).convert("1")
    temp = Image.open(BytesIO(base64.b64decode(path))).convert("1")
    temp.load()
    temp = temp.resize((28, 28))
    temp_tensor = np.asarray(temp, dtype="int64")
    temp_tensor = np.reshape(temp_tensor, newshape=(1, 28 ** 2))
    temp.close()
    temp_net = open_net(neural_name)
    pred_net = NeuralNet(input_size=temp_tensor.shape[1], num_hidden_layers=temp_net.num_hidden_layers,
                         output_size=temp_net.output_size, width=temp_net.width,
                         activation_func=temp_net.activation_func, loss_func=LOSS_FUNCTION, learning_rate=temp_net.lr,
                         dropout=temp_net.dropout)
    for i, j in zip(temp_net.layers, pred_net.layers):
        j.weights = i.weights
        j.bias = i.bias
    value, probability = pred_net.predict(temp_tensor)
    str2 = f"{value},{probability}"
    return str2

# New user training a new model: pass num_hidden_layers, width, activation_func, learning_rate, dropout, epochs, netName
#       activation_func can be Sigmoid or ReLU
# old user needs their model: pass absolute path to the pic to be predicted, name of user file so i can grab neural_net


def test(a, b):
    return "hello"


if __name__ == "__main__":
    args = argv[1:]

    if len(args) is 7:
        print(make_and_train_net(*args))
        stdout.flush()
    elif len(args) is 2:
        print(predict_image(*args))
        stdout.flush()
    else:
        if not DEVELOP_MODE:
            print("error unsupported amount of args detected")
            print("call with either num_hidden_layers, width, activation_func, learning_rate, dropout, epochs, net_name")
            print("or call with the absolute path to the image and the name of the net")
    # used to flush stdout so node can read from it send data back as comma separated string
    stdout.flush()


# TODO ask about solution to exploding gradients
# TODO fix sigmoid?
# TODO ask why ReLU is working better
# TODO implement 5 fold cross validation
