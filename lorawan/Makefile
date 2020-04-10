# name of your application
APPLICATION = lorawantest

# Use the ST B-L072Z-LRWAN1 board by default:
BOARD ?= b-l072z-lrwan1

BOARD_INSUFFICIENT_MEMORY := nucleo-f031k6 nucleo-f042k6 nucleo-l031k6
# This has to be the absolute path to the RIOT base directory:
RIOTBASE ?= $(CURDIR)/../..
EMCUTE_ID ?= testing2020

DEVEUI ?= INSERT_DEVEUI
APPEUI ?= INSERT_APPEUI
APPKEY ?= INSERT_APPKEY

# Default radio driver is Semtech SX1276 (used by the B-L072Z-LRWAN1 board)
DRIVER ?= sx1276

# Default region is Europe and default band is 868MHz
REGION ?= EU868

# Include the Semtech-loramac package
USEPKG += semtech-loramac

USEMODULE += $(DRIVER)
USEMODULE += fmt
USEMODULE += hts221
USEMODULE += xtimer
USEMODULE += semtech_loramac_rx
FEATURES_REQUIRED += periph_rtc

CFLAGS += -DREGION_$(REGION)
CFLAGS += -DDEVEUI=\"$(DEVEUI)\" -DAPPEUI=\"$(APPEUI)\" -DAPPKEY=\"$(APPKEY)\"
CFLAGS += -DLORAMAC_ACTIVE_REGION=LORAMAC_REGION_$(REGION)
# Comment this out to disable code in RIOT that does safety checking
# which is not needed in a production environment but helps in the
# development process:
DEVELHELP ?= 1

# Allow for env-var-based override of the nodes name (EMCUTE_ID)
ifneq (,$(EMCUTE_ID))
  CFLAGS += -DEMCUTE_ID=\"$(EMCUTE_ID)\"
endif

# Change this to 0 show compiler invocation lines by default:
QUIET ?= 1

include $(RIOTBASE)/Makefile.include
