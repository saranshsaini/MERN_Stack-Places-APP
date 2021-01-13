import React, { useEffect, useState, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { AuthContext } from "../../shared/context/auth-context";
import Card from "../../shared/components/UIElements/Card";
import { useForm } from "../../shared/hooks/form-hook";
import "./PlaceForm.css";

const UpdatePlace = (props) => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState(null);
  const placeId = useParams().placeId;
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/places/${placeId}`
        );
        setLoadedPlace(responseData.place);
        setFormData(
          {
            title: {
              value: responseData.place.title,
              isValid: true,
            },
            description: {
              value: responseData.place.description,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        { "Content-Type": "application/json" }
      );
      history.push("/" + auth.userId + "/places");
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }
  if (!loadedPlace && !error) {
    return (
      <div className="center">
        <Card>
          <h2>No such place</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlace && (
        <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Valid title, this is not"
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            type="text"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Valid description, this is not"
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          />
          <Button typle="submit" disabled={!formState.isValid}>
            Update Place
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdatePlace;
