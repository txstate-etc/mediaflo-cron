IMAGE_NAME?=registry.its.txstate.edu/mfcron
QUAL_TAG?=qual
PROD_TAG?=prod
SAVE_TAG?=$(shell date +"%Y-%m-%d")-$(shell git rev-parse --short HEAD)

OK_COLOR=\033[32;01m
NO_COLOR=\033[0m

build:
	@echo "$(OK_COLOR)==>$(NO_COLOR) Building $(IMAGE_NAME):$(QUAL_TAG)"
	@docker build --rm -t $(IMAGE_NAME):$(QUAL_TAG) .

qual: build
	@echo "$(OK_COLOR)==>$(NO_COLOR) Pushing $(IMAGE_NAME):$(QUAL_TAG)"
	@docker push $(IMAGE_NAME):$(QUAL_TAG)

save-prod:
	@echo "$(OK_COLOR)==>$(NO_COLOR) Pulling $(IMAGE_NAME):$(PROD_TAG)"
	@docker pull $(IMAGE_NAME):$(PROD_TAG)
	@echo "$(OK_COLOR)==>$(NO_COLOR) Tagging $(IMAGE_NAME):$(PROD_TAG) -> $(IMAGE_NAME):$(SAVE_TAG)"
	@docker tag $(IMAGE_NAME):$(PROD_TAG) $(IMAGE_NAME):$(SAVE_TAG)
	@echo "$(OK_COLOR)==>$(NO_COLOR) Pushing $(IMAGE_NAME):$(SAVE_TAG)"
	@docker push $(IMAGE_NAME):$(SAVE_TAG)

prod: save-prod
	@echo "$(OK_COLOR)==>$(NO_COLOR) Pulling $(IMAGE_NAME):$(QUAL_TAG)"
	@docker pull $(IMAGE_NAME):$(QUAL_TAG)
	@echo "$(OK_COLOR)==>$(NO_COLOR) Tagging $(IMAGE_NAME):$(QUAL_TAG) -> $(IMAGE_NAME):$(PROD_TAG)"
	@docker tag $(IMAGE_NAME):$(QUAL_TAG) $(IMAGE_NAME):$(PROD_TAG)
	@echo "$(OK_COLOR)==>$(NO_COLOR) Pushing $(IMAGE_NAME):$(PROD_TAG)"
	@docker push $(IMAGE_NAME):$(PROD_TAG)

tag:
	@echo $(SAVE_TAG)
